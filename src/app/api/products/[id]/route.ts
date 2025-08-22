import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { 
        id: params.id,
        isActive: true 
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Parse imageUrls from JSON string to array
    const productWithParsedImages = {
      ...product,
      imageUrls: JSON.parse(product.imageUrls)
    }

    return NextResponse.json(productWithParsedImages)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
