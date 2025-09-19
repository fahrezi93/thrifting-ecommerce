import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Check if user has already reviewed a specific order item
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const orderItemId = searchParams.get('orderItemId')

    if (!orderItemId) {
      return NextResponse.json(
        { error: 'Order item ID is required' },
        { status: 400 }
      )
    }

    // Check if review exists for this user and order item
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        orderItemId: orderItemId
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      hasReview: !!existingReview,
      review: existingReview
    })
  } catch (error) {
    console.error('Error checking review status:', error)
    return NextResponse.json(
      { error: 'Failed to check review status' },
      { status: 500 }
    )
  }
}
