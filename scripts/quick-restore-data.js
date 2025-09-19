const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function quickRestoreData() {
  try {
    console.log('🚀 Quick Restore Data...\n')
    
    // Create categories
    console.log('📁 Creating categories...')
    const categories = []
    
    const categoryData = [
      { name: 'Fashion Pria', slug: 'fashion-pria', description: 'Pakaian dan aksesoris untuk pria' },
      { name: 'Fashion Wanita', slug: 'fashion-wanita', description: 'Pakaian dan aksesoris untuk wanita' },
      { name: 'Elektronik', slug: 'elektronik', description: 'Perangkat elektronik bekas berkualitas' },
      { name: 'Buku & Majalah', slug: 'buku-majalah', description: 'Koleksi buku dan majalah bekas' }
    ]
    
    for (const catData of categoryData) {
      try {
        const category = await prisma.category.create({ data: catData })
        categories.push(category)
        console.log(`✅ Created category: ${category.name}`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Category ${catData.name} already exists, skipping...`)
          const existing = await prisma.category.findUnique({ where: { slug: catData.slug } })
          if (existing) categories.push(existing)
        } else {
          throw error
        }
      }
    }
    
    // Create products
    console.log('\n📦 Creating products...')
    const productData = [
      {
        name: 'Kemeja Batik Pria Premium',
        description: 'Kemeja batik berkualitas tinggi dengan motif tradisional Indonesia.',
        price: 150000,
        stock: 5,
        categoryId: categories[0].id,
        imageUrls: JSON.stringify(['/api/placeholder/400/400']),
        size: 'L',
        condition: 'Sangat Baik',
        brand: 'Batik Keris',
        color: 'Coklat'
      },
      {
        name: 'Dress Vintage Wanita',
        description: 'Dress vintage dengan desain klasik yang timeless.',
        price: 200000,
        stock: 3,
        categoryId: categories[1].id,
        imageUrls: JSON.stringify(['/api/placeholder/400/400']),
        size: 'M',
        condition: 'Excellent',
        brand: 'Vintage Collection',
        color: 'Merah'
      },
      {
        name: 'iPhone 12 Second',
        description: 'iPhone 12 bekas dengan kondisi mulus. Fullset dengan charger original.',
        price: 8500000,
        stock: 2,
        categoryId: categories[2].id,
        imageUrls: JSON.stringify(['/api/placeholder/400/400']),
        size: '128GB',
        condition: 'Sangat Baik',
        brand: 'Apple',
        color: 'Hitam'
      },
      {
        name: 'Novel Harry Potter Set',
        description: 'Set lengkap novel Harry Potter 1-7 dalam bahasa Indonesia.',
        price: 350000,
        stock: 1,
        categoryId: categories[3].id,
        imageUrls: JSON.stringify(['/api/placeholder/400/400']),
        size: 'Set Lengkap',
        condition: 'Baik',
        brand: 'Gramedia',
        color: 'Multi'
      }
    ]
    
    let productCount = 0
    for (const prodData of productData) {
      try {
        await prisma.product.create({ data: prodData })
        productCount++
        console.log(`✅ Created product: ${prodData.name}`)
      } catch (error) {
        console.log(`⚠️  Product ${prodData.name} might already exist, skipping...`)
      }
    }
    
    console.log(`\n🎉 Restore completed!`)
    console.log(`📊 Summary:`)
    console.log(`   Categories: ${categories.length}`)
    console.log(`   Products: ${productCount}`)
    console.log(`\n💡 You can now:`)
    console.log(`   1. View products in admin panel`)
    console.log(`   2. Browse products as customer`)
    console.log(`   3. Test notification system`)
    
  } catch (error) {
    console.error('❌ Error restoring data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

quickRestoreData()
