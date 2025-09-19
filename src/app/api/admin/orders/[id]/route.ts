import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../lib/auth'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request)
    const { status } = await request.json()

    // Get the order with user info before updating
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    })

    // Create notification for user about status change
    if (existingOrder.status !== status) {
      const statusMessages = {
        PROCESSING: 'Your order is being processed',
        PAID: 'Your payment has been confirmed',
        SHIPPED: 'Your order is being shipped',
        DELIVERED: 'Your order has been delivered',
        CANCELLED: 'Your order has been cancelled'
      }

      const message = `${statusMessages[status as keyof typeof statusMessages] || 'Your order status has been updated'} - #${existingOrder.orderNumber}`

      // Only send notification if Pusher is configured
      if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET) {
        try {
          console.log('Pusher environment variables check:', {
            appId: process.env.PUSHER_APP_ID ? 'Present' : 'Missing',
            key: process.env.PUSHER_KEY ? 'Present' : 'Missing',
            secret: process.env.PUSHER_SECRET ? 'Present' : 'Missing',
            cluster: process.env.PUSHER_CLUSTER ? 'Present' : 'Missing'
          })

          const notification = await prisma.notification.create({
            data: {
              userId: existingOrder.userId,
              title: 'Order Status Update',
              message: message,
              type: 'order',
              url: `/dashboard/orders/${existingOrder.id}`
            }
          })

          console.log('Created notification:', notification)
          console.log('Triggering Pusher event:', {
            channel: `user-${existingOrder.userId}`,
            event: 'new-notification',
            data: notification
          })

          await pusher.trigger(`user-${existingOrder.userId}`, 'new-notification', notification)
          console.log('Pusher notification sent successfully')
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError)
          console.error('Notification error details:', {
            message: notificationError instanceof Error ? notificationError.message : String(notificationError),
            stack: notificationError instanceof Error ? notificationError.stack : undefined
          })
          // Don't fail the order update if notification fails
        }
      } else {
        console.log('Pusher not configured - skipping notification')
      }
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request)

    // Delete order items first (due to foreign key constraints)
    await prisma.orderItem.deleteMany({
      where: { orderId: params.id }
    })

    // Then delete the order
    await prisma.order.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
