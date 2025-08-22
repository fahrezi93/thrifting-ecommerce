const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Sample products data inline since we can't import TS files directly
const sampleProducts = [
  {
    id: '1',
    name: 'Vintage Denim Jacket',
    description: 'Classic blue denim jacket.',
    price: 150000,
    imageUrls: ['https://via.placeholder.com/400x400/3B82F6/FFFFFF?text=Denim+Jacket'],
    category: 'TOPS',
    size: 'M',
    condition: 'Excellent',
    brand: 'Levi\'s',
    color: 'Blue',
    stock: 1,
    createdAt: new Date('2024-07-20'),
  },
  {
    id: '2',
    name: 'Striped Cotton T-Shirt',
    description: 'Comfortable striped t-shirt.',
    price: 45000,
    imageUrls: ['https://via.placeholder.com/400x400/10B981/FFFFFF?text=T-Shirt'],
    category: 'TOPS',
    size: 'S',
    condition: 'Good',
    brand: 'Uniqlo',
    color: 'White/Blue',
    stock: 2,
    createdAt: new Date('2024-07-19'),
  },
  {
    id: '3',
    name: 'High-Waisted Jeans',
    description: 'Trendy high-waisted jeans.',
    price: 125000,
    imageUrls: ['https://via.placeholder.com/400x400/6366F1/FFFFFF?text=Jeans'],
    category: 'BOTTOMS',
    size: 'M',
    condition: 'Excellent',
    brand: 'Zara',
    color: 'Dark Blue',
    stock: 1,
    createdAt: new Date('2024-07-18'),
  },
  {
    id: '4',
    name: 'Floral Summer Dress',
    description: 'Light floral summer dress.',
    price: 135000,
    imageUrls: ['https://via.placeholder.com/400x400/EC4899/FFFFFF?text=Summer+Dress'],
    category: 'DRESSES',
    size: 'M',
    condition: 'Excellent',
    brand: 'Zara',
    color: 'Floral',
    stock: 1,
    createdAt: new Date('2024-07-17'),
  },
  {
    id: '5',
    name: 'Leather Jacket',
    description: 'Classic black leather jacket.',
    price: 350000,
    imageUrls: ['https://via.placeholder.com/400x400/1F2937/FFFFFF?text=Leather+Jacket'],
    category: 'OUTERWEAR',
    size: 'M',
    condition: 'Excellent',
    brand: 'AllSaints',
    color: 'Black',
    stock: 1,
    createdAt: new Date('2024-07-16'),
  }
]

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')
    
    // Clear existing products
    await prisma.product.deleteMany()
    console.log('🗑️  Cleared existing products')
    
    // Insert sample products
    for (const product of sampleProducts) {
      await prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrls: JSON.stringify(product.imageUrls),
          category: product.category,
          size: product.size,
          condition: product.condition,
          brand: product.brand || null,
          color: product.color || null,
          stock: product.stock || 1,
          isActive: true,
          createdAt: product.createdAt || new Date(),
          updatedAt: new Date()
        }
      })
    }
    
    console.log(`✅ Successfully seeded ${sampleProducts.length} products`)
    
    // Verify the seeding
    const count = await prisma.product.count()
    console.log(`📊 Total products in database: ${count}`)
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
seedDatabase()
  .then(() => {
    console.log('🎉 Database seeding completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Database seeding failed:', error)
    process.exit(1)
  })
