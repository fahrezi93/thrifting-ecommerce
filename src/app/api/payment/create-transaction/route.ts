import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

const midtransClient = require('midtrans-client')

// For development, use dummy values if env vars are missing
const snap = new midtransClient.Snap({
  isProduction: false, // Always use sandbox for development
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-dummy-key-for-dev',
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { items, shippingAddressId, totalAmount, shippingCost } = await request.json()

    // Validate shipping address belongs to user
    const shippingAddress = await prisma.address.findFirst({
      where: {
        id: shippingAddressId,
        userId: user.id
      }
    })

    if (!shippingAddress) {
      return NextResponse.json({ error: 'Invalid shipping address' }, { status: 400 })
    }

    // Create order in database
    const orderNumber = `TH-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount,
        shippingCost,
        status: 'PENDING',
        userId: user.id,
        shippingAddressId,
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true,
        shippingAddress: true
      }
    })

    // Prepare Midtrans transaction parameters
    const transactionDetails = {
      order_id: order.id,
      gross_amount: Math.round(totalAmount),
    }

    const itemDetails = [
      ...items.map((item: any) => ({
        id: item.id,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.name,
      })),
      {
        id: 'shipping',
        price: Math.round(shippingCost),
        quantity: 1,
        name: 'Shipping Cost',
      }
    ]

    const customerDetails = {
      first_name: user.name?.split(' ')[0] || 'Customer',
      last_name: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      phone: shippingAddress.phone || '',
      billing_address: {
        first_name: user.name?.split(' ')[0] || 'Customer',
        last_name: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone: shippingAddress.phone || '',
        address: shippingAddress.street,
        city: shippingAddress.city,
        postal_code: shippingAddress.postalCode,
        country_code: 'IDN'
      },
      shipping_address: {
        first_name: user.name?.split(' ')[0] || 'Customer',
        last_name: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone: shippingAddress.phone || '',
        address: shippingAddress.street,
        city: shippingAddress.city,
        postal_code: shippingAddress.postalCode,
        country_code: 'IDN'
      }
    }

    const parameter = {
      transaction_details: transactionDetails,
      item_details: itemDetails,
      customer_details: customerDetails,
      enabled_payments: [
        'credit_card', 'mandiri_clickpay', 'cimb_clicks',
        'bca_klikbca', 'bca_klikpay', 'bri_epay', 'echannel',
        'permata_va', 'bca_va', 'bni_va', 'other_va', 'gopay',
        'indomaret', 'danamon_online', 'akulaku'
      ]
    }

    // For development without real Midtrans credentials, create a mock transaction
    let transactionToken = 'dev-mock-token-' + Date.now()
    
    try {
      // Try to create real transaction if credentials are available
      if (process.env.MIDTRANS_SERVER_KEY && !process.env.MIDTRANS_SERVER_KEY.includes('dummy')) {
        const transaction = await snap.createTransaction(parameter)
        transactionToken = transaction.token
      }
    } catch (midtransError) {
      console.log('Using mock transaction for development:', midtransError)
    }

    // Update order with transaction ID
    await prisma.order.update({
      where: { id: order.id },
      data: { midtransTransactionId: transactionToken }
    })

    return NextResponse.json({
      transactionToken,
      orderId: order.id,
      orderNumber: order.orderNumber
    })

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating transaction:', error)
    return NextResponse.json({ 
      error: 'Failed to create transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
