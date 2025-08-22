import { NextRequest, NextResponse } from 'next/server'
import { sampleProducts } from '@/lib/sample-data'

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

    let filteredProducts = sampleProducts

    // Apply filters
    if (search) {
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.brand?.toLowerCase().includes(search)
      )
    }
    if (categories && categories.length > 0) {
      filteredProducts = filteredProducts.filter((p) => categories.includes(p.category))
    }
    if (sizes && sizes.length > 0) {
      filteredProducts = filteredProducts.filter((p) => sizes.includes(p.size))
    }
    if (conditions && conditions.length > 0) {
      filteredProducts = filteredProducts.filter((p) => conditions.includes(p.condition))
    }
    filteredProducts = filteredProducts.filter((p) => p.price >= minPrice && p.price <= maxPrice)

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filteredProducts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
      case 'oldest':
        filteredProducts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        break
      case 'price-low':
        filteredProducts.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filteredProducts.sort((a, b) => b.price - a.price)
        break
      case 'name':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    // The frontend expects an object with a 'products' property
    return NextResponse.json(filteredProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

