import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Create a new review
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { rating, comment, productId, orderItemId } = await request.json()

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if order item belongs to user and order is delivered
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        order: {
          userId: user.id,
          status: 'DELIVERED'
        }
      },
      include: {
        order: true
      }
    })

    if (!orderItem) {
      return NextResponse.json(
        { error: 'Order item not found or order not delivered' },
        { status: 404 }
      )
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        orderItemId: orderItemId
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this product' },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: user.id,
        productId,
        orderItemId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

// Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
      : 0

    return NextResponse.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
