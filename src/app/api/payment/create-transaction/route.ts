import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

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

    // Create notification for admin users
    try {
      // Find all admin users
      const adminUsers = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, name: true, email: true }
      })

      // Create notifications for each admin
      for (const admin of adminUsers) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            message: `🛒 New Order #${order.orderNumber} from ${user.name || user.email} - Total: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalAmount)}`,
            url: `/admin/orders/${order.id}`,
            isRead: false
          }
        })

        // Send real-time notification via Pusher
        await pusher.trigger(`user-${admin.id}`, 'notification', {
          title: 'New Order Received',
          message: `New order #${order.orderNumber} from ${user.name || user.email}`,
          type: 'ORDER',
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: totalAmount,
          url: `/admin/orders/${order.id}`
        })
      }
    } catch (notificationError) {
      console.error('Error creating admin notifications:', notificationError)
      // Don't fail the order creation if notification fails
    }

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
