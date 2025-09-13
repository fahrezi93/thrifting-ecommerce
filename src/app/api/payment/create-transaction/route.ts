import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { items, shippingAddressId, totalAmount, shippingCost } = await request.json()

    if (!items || !shippingAddressId || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        shippingAddressId,
        totalAmount,
        shippingCost: shippingCost || 0,
        status: 'PENDING',
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
        shippingAddress: true,
        user: true
      }
    })

    // Return transaction token (order ID) for payment processing
    return NextResponse.json({
      success: true,
      transactionToken: order.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount
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
