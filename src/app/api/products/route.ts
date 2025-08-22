import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search')?.toLowerCase()
    const categories = searchParams.get('categories')?.split(',')
    const sizes = searchParams.get('sizes')?.split(',')
    const conditions = searchParams.get('conditions')?.split(',')
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '10000000')
    const sortBy = searchParams.get('sortBy') || 'newest'

    // Build Prisma query conditions
    const whereConditions: any = {
      isActive: true,
      price: {
        gte: minPrice,
        lte: maxPrice
      }
    }

    if (categories && categories.length > 0) {
      whereConditions.category = { in: categories }
    }

    if (sizes && sizes.length > 0) {
      whereConditions.size = { in: sizes }
    }

    if (conditions && conditions.length > 0) {
      whereConditions.condition = { in: conditions }
    }

    if (search) {
      whereConditions.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { brand: { contains: search } }
      ]
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' }
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'price-low':
        orderBy = { price: 'asc' }
        break
      case 'price-high':
        orderBy = { price: 'desc' }
        break
      case 'name':
        orderBy = { name: 'asc' }
        break
    }

    const products = await prisma.product.findMany({
      where: whereConditions,
      orderBy
    })

    // Parse imageUrls from JSON string to array for all products
    const filteredProducts = products.map(product => ({
      ...product,
      imageUrls: JSON.parse(product.imageUrls)
    }))

    return NextResponse.json(filteredProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

