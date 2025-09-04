import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request)

    const requestBody = await request.json()
    console.log('Update product request body:', requestBody)
    console.log('Product ID:', params.id)

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
      isActive,
      isFeatured 
    } = requestBody

    // Convert price and stock to numbers
    const numericPrice = parseFloat(price)
    const numericStock = parseInt(stock)

    console.log('Parsed values:', {
      name,
      description,
      price: numericPrice,
      imageUrls,
      category,
      size,
      condition,
      brand,
      color,
      stock: numericStock,
      isActive,
      isFeatured
    })

    // Handle category - if empty string, don't update it
    const updateData: any = {
      name,
      description,
      price: numericPrice,
      imageUrls: JSON.stringify(imageUrls),
      size,
      condition,
      brand,
      color,
      stock: numericStock,
      isActive,
      isFeatured,
    }

    // Only update category if it's not empty
    if (category && category.trim() !== '') {
      // Try to find existing category first
      let categoryRecord = await prisma.category.findFirst({
        where: { name: category }
      })
      
      if (!categoryRecord) {
        // Generate unique slug
        const baseSlug = category.toLowerCase().replace(/\s+/g, '-')
        let slug = baseSlug
        let counter = 1
        
        // Check if slug exists and increment if needed
        while (await prisma.category.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`
          counter++
        }
        
        categoryRecord = await prisma.category.create({
          data: {
            name: category,
            slug: slug,
            isActive: true
          }
        })
      }
      
      updateData.categoryId = categoryRecord.id
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData
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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      productId: params.id
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request)

    // First, delete all related OrderItems
    await prisma.orderItem.deleteMany({
      where: { productId: params.id }
    })

    // Then delete the product
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
