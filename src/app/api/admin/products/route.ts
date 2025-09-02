import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Parse imageUrls from JSON string to array
    const productsWithParsedImages = products.map(product => ({
      ...product,
      imageUrls: JSON.parse(product.imageUrls)
    }))

    return NextResponse.json(productsWithParsedImages)
  } catch (error) {
    console.error('Error fetching products:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized - Please login first' }, { status: 401 })
      }
      if (error.message === 'Admin access required') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/admin/products called')
  try {
    console.log('Checking admin authentication...')
    const user = await requireAdmin(request)
    console.log('Admin authentication successful:', user.email)

    console.log('Parsing request body...')
    const body = await request.json()
    console.log('Request body:', body)
    
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
    } = body
    
    console.log('Product data:', { name, price, category, size, condition, stock, imageUrls: imageUrls?.length })

    // Validate required fields
    if (!name || !description || !price || !category || !size || !condition) {
      console.log('Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Creating product in database...')
    // Find category by name to get categoryId
    let categoryRecord = await prisma.category.findFirst({
      where: { 
        OR: [
          { name: category },
          { name: category.toLowerCase() },
          { name: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() }
        ]
      }
    })
    
    // If category doesn't exist, create it
    if (!categoryRecord) {
      console.log('Category not found, creating:', category)
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
      const categorySlug = category.toLowerCase()
      
      categoryRecord = await prisma.category.create({
        data: {
          name: categoryName,
          slug: categorySlug,
          description: `${categoryName} category`,
          imageUrl: '/placeholder-image.jpg',
          isActive: true
        }
      })
      console.log('Category created:', categoryRecord.id)
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        imageUrls: JSON.stringify(imageUrls || []),
        categoryId: categoryRecord.id,
        size,
        condition,
        brand: brand || null,
        color: color || null,
        stock: Number(stock) || 1,
        isActive: Boolean(isActive),
      }
    })
    
    console.log('Product created successfully:', product.id)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized - Please login first' }, { status: 401 })
      }
      if (error.message === 'Admin access required') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
      
      // Log detailed error information
      console.error('Product creation error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      // Check for specific Prisma errors
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ error: 'Product with this name already exists' }, { status: 400 })
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json({ error: 'Invalid category or reference' }, { status: 400 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    }, { status: 500 })
  }
}
