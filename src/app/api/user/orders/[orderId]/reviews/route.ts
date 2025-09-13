import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get reviewable items for a specific order
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await requireAuth(request)
    
    // Get order with items that can be reviewed
    const order = await prisma.order.findFirst({
      where: {
        id: params.orderId,
        userId: user.id,
        status: 'DELIVERED'
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrls: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or not delivered' },
        { status: 404 }
      )
    }

    // Get existing reviews for this order
    const existingReviews = await prisma.review.findMany({
      where: {
        userId: user.id,
        orderItemId: {
          in: order.orderItems.map((item: any) => item.id)
        }
      }
    })

    // Map items with review status
    const reviewableItems = order.orderItems.map((item: any) => {
      const existingReview = existingReviews.find((review: any) => review.orderItemId === item.id)
      return {
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        hasReview: !!existingReview,
        review: existingReview || null
      }
    })

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      items: reviewableItems
    })
  } catch (error) {
    console.error('Error fetching reviewable items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviewable items' },
      { status: 500 }
    )
  }
}
