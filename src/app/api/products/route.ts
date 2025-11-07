import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search')?.toLowerCase()
    const categories = searchParams.get('categories')?.split(',')
    const category = searchParams.get('category') // Single category slug
    const sizes = searchParams.get('sizes')?.split(',')
    const conditions = searchParams.get('conditions')?.split(',')
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '10000000')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const featured = searchParams.get('featured') === 'true'

    // Build Prisma query conditions
    const whereConditions: any = {
      isActive: true,
      price: {
        gte: minPrice,
        lte: maxPrice
      }
    }

    // Filter by featured
    if (featured) {
      whereConditions.isFeatured = true
    }

    // Filter by single category slug
    if (category) {
      whereConditions.category = {
        slug: category
      }
    }

    if (categories && categories.length > 0) {
      // Convert categories to proper case for database matching
      const formattedCategories = categories.map(cat => {
        // Convert "TOPS" to "Tops", "BOTTOMS" to "Bottoms", etc.
        return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()
      })
      
      console.log('Category filter:', {
        original: categories,
        formatted: formattedCategories
      })
      
      whereConditions.category = {
        name: { in: formattedCategories }
      }
    }

    if (sizes && sizes.length > 0) {
      whereConditions.size = { in: sizes }
    }

    if (conditions && conditions.length > 0) {
      whereConditions.condition = { in: conditions }
    }

    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
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

    console.log('Query conditions:', JSON.stringify(whereConditions, null, 2))
    
    const products = await prisma.product.findMany({
      where: whereConditions,
      include: {
        category: true
      },
      orderBy
    })

    console.log(`Found ${products.length} products`)
    if (products.length > 0) {
      console.log('Sample products:', products.slice(0, 3).map(p => ({ 
        name: p.name, 
        category: p.category.name,
        price: p.price 
      })))
    }

    // Parse imageUrls - handle both JSON array strings and plain URL strings
    const filteredProducts = products.map(product => {
      let imageUrls = []
      try {
        if (product.imageUrls) {
          const parsed = JSON.parse(product.imageUrls)
          imageUrls = Array.isArray(parsed) ? parsed : [product.imageUrls]
        }
      } catch {
        // If parsing fails, treat as single URL string
        imageUrls = product.imageUrls ? [product.imageUrls] : []
      }
      
      return {
        ...product,
        imageUrls
      }
    })

    return NextResponse.json(filteredProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

