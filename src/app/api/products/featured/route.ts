import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Use raw SQL to fetch featured products until Prisma client is updated
    const featuredProducts = await prisma.$queryRaw`
      SELECT p.*, c.name as categoryName, c.slug as categorySlug 
      FROM Product p 
      LEFT JOIN Category c ON p.categoryId = c.id 
      WHERE p.isFeatured = 1 AND p.isActive = 1 AND p.stock > 0 
      ORDER BY p.updatedAt DESC 
      LIMIT 8
    `

    return NextResponse.json(featuredProducts)
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    )
  }
}
