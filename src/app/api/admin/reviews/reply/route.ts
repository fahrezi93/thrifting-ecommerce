import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Reply to review (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { reviewId, adminReply } = await request.json()

    if (!reviewId || !adminReply || !adminReply.trim()) {
      return NextResponse.json(
        { error: 'Review ID and admin reply are required' },
        { status: 400 }
      )
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Update review with admin reply
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        adminReply: adminReply.trim(),
        repliedBy: user.id,
        repliedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            imageUrls: true
          }
        }
      }
    })

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error('Error replying to review:', error)
    return NextResponse.json(
      { error: 'Failed to reply to review' },
      { status: 500 }
    )
  }
}

// Update admin reply
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { reviewId, adminReply } = await request.json()

    if (!reviewId || !adminReply || !adminReply.trim()) {
      return NextResponse.json(
        { error: 'Review ID and admin reply are required' },
        { status: 400 }
      )
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Update admin reply
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        adminReply: adminReply.trim(),
        repliedBy: user.id,
        repliedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            imageUrls: true
          }
        }
      }
    })

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error('Error updating admin reply:', error)
    return NextResponse.json(
      { error: 'Failed to update admin reply' },
      { status: 500 }
    )
  }
}

// Delete admin reply
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('reviewId')

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Remove admin reply
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        adminReply: null,
        repliedBy: null,
        repliedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            imageUrls: true
          }
        }
      }
    })

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error('Error deleting admin reply:', error)
    return NextResponse.json(
      { error: 'Failed to delete admin reply' },
      { status: 500 }
    )
  }
}
