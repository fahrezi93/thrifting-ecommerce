const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testOrderNavigation() {
  try {
    console.log('🧪 Testing Order Navigation System...\n')
    
    // Get some orders to test with
    const orders = await prisma.order.findMany({
      take: 3,
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true
      }
    })
    
    if (orders.length === 0) {
      console.log('❌ No orders found for testing!')
      return
    }
    
    console.log(`✅ Found ${orders.length} order(s) for testing`)
    
    orders.forEach((order, index) => {
      console.log(`\n📦 Order ${index + 1}:`)
      console.log(`   - ID: ${order.id}`)
      console.log(`   - Order Number: ${order.orderNumber}`)
      console.log(`   - Status: ${order.status}`)
      console.log(`   - User: ${order.user.email}`)
      console.log(`   - Items: ${order.orderItems.length}`)
      console.log(`   - Total: Rp ${order.totalAmount.toLocaleString('id-ID')}`)
      console.log(`   - Detail URL: /dashboard/orders/${order.id}`)
    })
    
    console.log('\n🎯 Navigation Test Instructions:')
    console.log('1. Login as a user who has orders')
    console.log('2. Go to /dashboard/orders')
    console.log('3. Click "View Details" on any order')
    console.log('4. Should navigate to /dashboard/orders/[orderId]')
    console.log('5. Verify mobile responsive design')
    console.log('6. Test "Back to Orders" button')
    
    console.log('\n📱 Mobile Test Checklist:')
    console.log('✓ Header should stack vertically on mobile')
    console.log('✓ Status badge should be left-aligned on mobile')
    console.log('✓ Timeline items should show timestamps below on mobile')
    console.log('✓ Order items should be smaller on mobile')
    console.log('✓ Text should be appropriately sized for mobile')
    
  } catch (error) {
    console.error('❌ Error testing order navigation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testOrderNavigation()
