import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    const { orderId, status } = await request.json()

    console.log('Admin updating order status:', orderId, 'to', status)

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status,
        paidAt: status === 'PAID' ? new Date() : null,
        updatedAt: new Date()
      }
    })

    console.log('Order status updated successfully:', updatedOrder.orderNumber)

    return NextResponse.json({
      success: true,
      order: updatedOrder
    })

  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}
