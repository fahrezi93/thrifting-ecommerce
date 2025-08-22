import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Get user's cart from database
    const userCart = await prisma.user.findUnique({
      where: { id: user.id },
      select: { cartData: true }
    })
    
    const cartItems = userCart?.cartData ? JSON.parse(userCart.cartData) : []
    
    return NextResponse.json({ items: cartItems })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { items } = await request.json()
    
    // Save cart items to database
    await prisma.user.update({
      where: { id: user.id },
      data: { cartData: JSON.stringify(items) }
    })
    
    return NextResponse.json({ message: 'Cart saved successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error saving cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
