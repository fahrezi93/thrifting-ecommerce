const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`\n=== SEMUA ORDERS DI DATABASE (${orders.length} orders) ===\n`)
    
    let totalRevenue = 0
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order: ${order.orderNumber}`)
      console.log(`   Status: ${order.status}`)
      console.log(`   Amount: Rp ${order.totalAmount.toLocaleString('id-ID')}`)
      console.log(`   User: ${order.user.name || order.user.email}`)
      console.log(`   Date: ${order.createdAt.toLocaleDateString('id-ID')}`)
      console.log(`   Payment Method: ${order.paymentMethod || 'N/A'}`)
      
      if (['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
        totalRevenue += order.totalAmount
      }
      console.log('')
    })

    console.log(`=== SUMMARY ===`)
    console.log(`Total Orders: ${orders.length}`)
    console.log(`Total Revenue (from completed orders): Rp ${totalRevenue.toLocaleString('id-ID')}`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOrders()
