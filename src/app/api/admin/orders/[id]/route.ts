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
        PROCESSING: 'Pesanan Anda sedang diproses',
        PAID: 'Pembayaran pesanan Anda telah dikonfirmasi',
        SHIPPED: 'Pesanan Anda sedang dalam pengiriman',
        DELIVERED: 'Pesanan Anda telah sampai di tujuan',
        CANCELLED: 'Pesanan Anda telah dibatalkan'
      }

      const message = `${statusMessages[status as keyof typeof statusMessages] || 'Status pesanan Anda telah diperbarui'} - #${existingOrder.orderNumber}`

      // Only send notification if Pusher is configured
      if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET) {
        try {
          const notification = await prisma.notification.create({
            data: {
              userId: existingOrder.userId,
              message: message,
              url: `/dashboard/orders/${existingOrder.id}`
            }
          })

          await pusher.trigger(`user-${existingOrder.userId}`, 'new-notification', notification)
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError)
          // Don't fail the order update if notification fails
        }
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
