import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await requireAuth(request)
    const { orderId } = params

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrls: true,
                size: true,
              }
            }
          }
        },
        shippingAddress: true,
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Transform to match the expected format
    const orderSummary = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      items: order.orderItems.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        size: item.product.size
      })),
      subtotal: order.totalAmount - order.shippingCost,
      shipping: order.shippingCost,
      total: order.totalAmount
    }

    return NextResponse.json(orderSummary)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
