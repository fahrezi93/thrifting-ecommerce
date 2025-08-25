const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedCategories() {
  try {
    // Create default categories
    const categories = [
      {
        id: 'cat-tops',
        name: 'Tops',
        slug: 'tops',
        description: 'T-shirts, blouses, sweaters, and other upper body clothing',
        imageUrl: '/placeholder-image.jpg'
      },
      {
        id: 'cat-bottoms',
        name: 'Bottoms',
        slug: 'bottoms',
        description: 'Jeans, pants, skirts, and shorts',
        imageUrl: '/placeholder-image.jpg'
      },
      {
        id: 'cat-dresses',
        name: 'Dresses',
        slug: 'dresses',
        description: 'Casual and formal dresses for all occasions',
        imageUrl: '/placeholder-image.jpg'
      },
      {
        id: 'cat-outerwear',
        name: 'Outerwear',
        slug: 'outerwear',
        description: 'Jackets, coats, blazers, and cardigans',
        imageUrl: '/placeholder-image.jpg'
      },
      {
        id: 'cat-shoes',
        name: 'Shoes',
        slug: 'shoes',
        description: 'Sneakers, heels, boots, and sandals',
        imageUrl: '/placeholder-image.jpg'
      },
      {
        id: 'cat-accessories',
        name: 'Accessories',
        slug: 'accessories',
        description: 'Bags, jewelry, scarves, and other accessories',
        imageUrl: '/placeholder-image.jpg'
      }
    ]

    for (const category of categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: category,
        create: category
      })
    }

    console.log('Categories seeded successfully!')

    // Update existing products to use category IDs
    await prisma.product.updateMany({
      where: { category: 'TOPS' },
      data: { categoryId: 'cat-tops' }
    })

    await prisma.product.updateMany({
      where: { category: 'BOTTOMS' },
      data: { categoryId: 'cat-bottoms' }
    })

    await prisma.product.updateMany({
      where: { category: 'DRESSES' },
      data: { categoryId: 'cat-dresses' }
    })

    await prisma.product.updateMany({
      where: { category: 'OUTERWEAR' },
      data: { categoryId: 'cat-outerwear' }
    })

    await prisma.product.updateMany({
      where: { category: 'SHOES' },
      data: { categoryId: 'cat-shoes' }
    })

    await prisma.product.updateMany({
      where: { category: 'ACCESSORIES' },
      data: { categoryId: 'cat-accessories' }
    })

    console.log('Products updated with category IDs!')
    
  } catch (error) {
    console.error('Error seeding categories:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedCategories()
