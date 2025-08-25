const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestOrder() {
  try {
    // Create a test user if not exists
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        id: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER'
      }
    })

    // Create a test address
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
        userId: testUser.id,
        isDefault: true
      }
    })

    // Create test products
    const product1 = await prisma.product.upsert({
      where: { id: 'test-product-1' },
      update: {},
      create: {
        id: 'test-product-1',
        name: 'Vintage Denim Jacket',
        description: 'Classic vintage denim jacket in excellent condition',
        price: 125000,
        imageUrls: JSON.stringify(['/placeholder-image.jpg']),
        category: 'OUTERWEAR',
        size: 'L',
        condition: 'Excellent',
        brand: 'Levi\'s',
        color: 'Blue',
        stock: 1
      }
    })

    const product2 = await prisma.product.upsert({
      where: { id: 'test-product-2' },
      update: {},
      create: {
        id: 'test-product-2',
        name: 'Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 45000,
        imageUrls: JSON.stringify(['/placeholder-image.jpg']),
        category: 'TOPS',
        size: 'M',
        condition: 'Good',
        brand: 'Uniqlo',
        color: 'White',
        stock: 2
      }
    })

    // Create test order
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: 'TH-TEST-001',
        totalAmount: 230000,
        shippingCost: 15000,
        status: 'PENDING',
        userId: testUser.id,
        shippingAddressId: testAddress.id,
        notes: 'Test order for payment system',
        orderItems: {
          create: [
            {
              quantity: 1,
              price: 125000,
              productId: product1.id
            },
            {
              quantity: 2,
              price: 45000,
              productId: product2.id
            }
          ]
        }
      }
    })

    console.log('Test order created successfully:', testOrder.id)
    console.log('Order Number:', testOrder.orderNumber)
    console.log('Total Amount:', testOrder.totalAmount)
    
  } catch (error) {
    console.error('Error creating test order:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestOrder()
