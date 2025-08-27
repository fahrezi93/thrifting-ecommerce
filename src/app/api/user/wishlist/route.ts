import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET user's wishlist
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(wishlistItems)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error("Error fetching wishlist:", error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST to add an item to the wishlist
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        productId: productId,
      },
    })

    return NextResponse.json(wishlistItem, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Handle potential duplicate creation
    if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Item already in wishlist' }, { status: 409 });
    }
    console.error("Error adding to wishlist:", error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE an item from the wishlist
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    await prisma.wishlistItem.deleteMany({
        where: {
            userId: user.id,
            productId: productId,
        },
    });

    return NextResponse.json({ message: 'Item removed from wishlist' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error("Error removing from wishlist:", error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
