import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Use Prisma ORM instead of raw SQL for better database compatibility
    const featuredProducts = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
        stock: {
          gt: 0
        }
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 8
    })

    // Transform the data to match the expected format
    const transformedProducts = featuredProducts.map(product => ({
      ...product,
      categoryName: product.category?.name || null,
      categorySlug: product.category?.slug || null
    }))

    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error('Error fetching featured products:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Failed to fetch featured products', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
