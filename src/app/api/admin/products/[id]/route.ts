import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        imageUrls: JSON.stringify(imageUrls),
        category,
        size,
        condition,
        brand,
        color,
        stock,
        isActive,
      }
    })

    // Parse imageUrls from JSON string to array for response
    const productWithParsedImages = {
      ...product,
      imageUrls: JSON.parse(product.imageUrls)
    }

    return NextResponse.json(productWithParsedImages)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request)

    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
