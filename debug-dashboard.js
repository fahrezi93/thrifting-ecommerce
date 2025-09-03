// Debug script to test admin dashboard queries
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDashboardQueries() {
  try {
    console.log('Testing database connection...')
    
    // Test basic counts
    console.log('1. Testing product count...')
    const productCount = await prisma.product.count({ where: { isActive: true } })
    console.log('Product count:', productCount)
    
    console.log('2. Testing order count...')
    const orderCount = await prisma.order.count()
    console.log('Order count:', orderCount)
    
    console.log('3. Testing user count...')
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
    
    console.log('4. Testing revenue aggregation...')
    const revenueResult = await prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true }
    })
    console.log('Revenue result:', revenueResult)
    
    console.log('5. Testing recent orders...')
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    console.log('Recent orders count:', recentOrders.length)
    
    console.log('6. Testing low stock products...')
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: 2 }
      },
      take: 5,
      select: {
        id: true,
        name: true,
        stock: true,
        imageUrls: true
      }
    })
    console.log('Low stock products count:', lowStockProducts.length)
    
    console.log('All dashboard queries completed successfully!')
    
  } catch (error) {
    console.error('Error in dashboard queries:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testDashboardQueries()
