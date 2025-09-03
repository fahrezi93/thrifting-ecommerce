import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Toggle featured: Starting request for product ID:', params.id)
    const { isFeatured } = await request.json()
    console.log('Toggle featured: New featured status:', isFeatured)

    // Update product featured status using Prisma ORM
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: { isFeatured: Boolean(isFeatured) },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })
    
    console.log('Toggle featured: Product updated successfully:', updatedProduct.id, 'Featured:', updatedProduct.isFeatured)
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating featured status:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Failed to update featured status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
