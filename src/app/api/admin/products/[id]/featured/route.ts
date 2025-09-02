import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isFeatured } = await request.json()

    // Update product featured status using raw SQL
    await prisma.$executeRaw`UPDATE Product SET isFeatured = ${isFeatured} WHERE id = ${params.id}`
    
    // Fetch the updated product
    const updatedProduct = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating featured status:', error)
    return NextResponse.json(
      { error: 'Failed to update featured status' },
      { status: 500 }
    )
  }
}
