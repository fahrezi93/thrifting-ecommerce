const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupAdmin() {
  try {
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@thrifthaven.com' },
      update: { role: 'ADMIN' },
      create: {
        id: 'admin-user-123',
        email: 'admin@thrifthaven.com',
        name: 'Admin User',
        role: 'ADMIN'
      }
    })

    console.log('Admin user created/updated:', adminUser.email)

    // Create some test products
    const products = [
      {
        id: 'product-1',
        name: 'Vintage Denim Jacket',
        description: 'Classic vintage denim jacket in excellent condition',
        price: 125000,
        imageUrls: JSON.stringify(['/placeholder-image.jpg']),
        category: 'OUTERWEAR',
        size: 'L',
        condition: 'Excellent',
        brand: 'Levi\'s',
        color: 'Blue',
        stock: 5
      },
      {
        id: 'product-2',
        name: 'Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 45000,
        imageUrls: JSON.stringify(['/placeholder-image.jpg']),
        category: 'TOPS',
        size: 'M',
        condition: 'Good',
        brand: 'Uniqlo',
        color: 'White',
        stock: 3
      },
      {
        id: 'product-3',
        name: 'Floral Dress',
        description: 'Beautiful floral summer dress',
        price: 85000,
        imageUrls: JSON.stringify(['/placeholder-image.jpg']),
        category: 'DRESSES',
        size: 'S',
        condition: 'Excellent',
        brand: 'Zara',
        color: 'Floral',
        stock: 2
      }
    ]

    for (const product of products) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product
      })
    }

    console.log('Test products created')

    // Create test address
    const testAddress = await prisma.address.upsert({
      where: { id: 'test-address-123' },
      update: {},
      create: {
        id: 'test-address-123',
        name: 'Test User',
        street: 'Jl. Test No. 123',
        city: 'Jakarta',
        state: 'DKI Jakarta',
        postalCode: '12345',
        country: 'Indonesia',
        phone: '081234567890',
        userId: adminUser.id,
        isDefault: true
      }
    })

    // Create test order with PAID status
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: 'TH-ADMIN-001',
        totalAmount: 170000,
        shippingCost: 15000,
        status: 'PAID',
        userId: adminUser.id,
        shippingAddressId: testAddress.id,
        notes: 'Test order for admin dashboard',
        paidAt: new Date(),
        orderItems: {
          create: [
            {
              quantity: 1,
              price: 125000,
              productId: 'product-1'
            },
            {
              quantity: 1,
              price: 45000,
              productId: 'product-2'
            }
          ]
        }
      }
    })

    console.log('Test order created:', testOrder.orderNumber)
    console.log('Setup completed successfully!')
    
  } catch (error) {
    console.error('Error setting up admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupAdmin()
