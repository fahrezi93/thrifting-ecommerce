import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { snap } from '@/lib/midtrans'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Fetch order with all details
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
        status: 'PENDING' // Only allow payment for pending orders
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrls: true
              }
            }
          }
        },
        shippingAddress: true,
        user: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found or already processed' }, { status: 404 })
    }

    // Prepare Midtrans transaction details
    const transactionDetails = {
      transaction_details: {
        order_id: order.orderNumber,
        gross_amount: Math.round(order.totalAmount)
      },
      customer_details: {
        first_name: user.name || 'Customer',
        last_name: '',
        email: user.email,
        phone: order.shippingAddress.phone || '081234567890',
        billing_address: {
          first_name: order.shippingAddress.name,
          last_name: '',
          email: user.email,
          phone: order.shippingAddress.phone || '081234567890',
          address: order.shippingAddress.street,
          city: order.shippingAddress.city,
          postal_code: order.shippingAddress.postalCode,
          country_code: 'IDN'
        },
        shipping_address: {
          first_name: order.shippingAddress.name,
          last_name: '',
          email: user.email,
          phone: order.shippingAddress.phone || '081234567890',
          address: order.shippingAddress.street,
          city: order.shippingAddress.city,
          postal_code: order.shippingAddress.postalCode,
          country_code: 'IDN'
        }
      },
      item_details: [
        ...order.orderItems.map(item => ({
          id: item.product.id,
          price: Math.round(item.price),
          quantity: item.quantity,
          name: item.product.name,
          brand: 'Thrift Haven',
          category: 'Fashion',
          merchant_name: 'Thrift Haven'
        })),
        // Add shipping as separate item
        ...(order.shippingCost > 0 ? [{
          id: 'shipping',
          price: Math.round(order.shippingCost),
          quantity: 1,
          name: 'Shipping Cost',
          brand: 'Thrift Haven',
          category: 'Shipping'
        }] : [])
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/success/${order.id}`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/failed/${order.id}`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/pending/${order.id}`
      },
      credit_card: {
        secure: true
      },
      expiry: {
        start_time: new Date().toISOString().replace(/\.\d{3}Z$/, ' +0700'),
        unit: 'hours',
        duration: 24
      }
    }

    // Create Snap token
    const snapResponse = await snap.createTransaction(transactionDetails)

    // Update order with Midtrans transaction ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        midtransTransactionId: order.orderNumber
      }
    })

    return NextResponse.json({
      success: true,
      token: snapResponse.token,
      redirect_url: (snapResponse as any).redirect_url,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount
    })

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating payment token:', error)
    return NextResponse.json({ 
      error: 'Failed to create payment token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
