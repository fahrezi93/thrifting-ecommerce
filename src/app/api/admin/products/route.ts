import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { 
      name, 
      description, 
      price, 
      imageUrls, 
      category, 
      size, 
      condition, 
      brand, 
      color, 
      stock, 
      isActive 
    } = await request.json()

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrls,
        category,
        size,
        condition,
        brand,
        color,
        stock,
        isActive,
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
