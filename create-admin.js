const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Create admin user directly
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@admin.com' },
      update: {
        role: 'ADMIN',
        name: 'Administrator',
        emailVerified: true
      },
      create: {
        id: 'admin-firebase-uid',
        email: 'admin@admin.com',
        name: 'Administrator',
        role: 'ADMIN',
        emailVerified: true
      }
    })

    console.log('✅ Admin user created/updated:', adminUser)
    
    // Create some test categories
    const categories = [
      { name: 'Tops', slug: 'tops', description: 'T-shirts, blouses, and tops' },
      { name: 'Bottoms', slug: 'bottoms', description: 'Pants, jeans, and skirts' },
      { name: 'Dresses', slug: 'dresses', description: 'Casual and formal dresses' },
      { name: 'Outerwear', slug: 'outerwear', description: 'Jackets and coats' },
      { name: 'Shoes', slug: 'shoes', description: 'All types of footwear' },
      { name: 'Accessories', slug: 'accessories', description: 'Bags, jewelry, and more' }
    ]

    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: category,
        create: category
      })
    }

    console.log('✅ Categories created/updated')
    console.log('🎉 Setup complete! You can now:')
    console.log('   1. Login with: admin@admin.com / 123456')
    console.log('   2. Access admin panel at: http://localhost:3000/admin')
    
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
