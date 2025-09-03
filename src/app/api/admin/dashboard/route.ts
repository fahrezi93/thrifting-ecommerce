import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin dashboard: Starting request')
    const user = await requireAdmin(request)
    console.log('Admin dashboard: User authenticated:', user.email)

    // Get total counts
    console.log('Admin dashboard: Fetching counts...')
    const [totalProducts, totalOrders, totalUsers] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count(),
    ])
    console.log('Admin dashboard: Counts fetched - Products:', totalProducts, 'Orders:', totalOrders, 'Users:', totalUsers)

    // Get total revenue from paid orders
    console.log('Admin dashboard: Fetching revenue...')
    const revenueResult = await prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true }
    })
    const totalRevenue = Number(revenueResult._sum.totalAmount) || 0
    console.log('Admin dashboard: Revenue fetched:', totalRevenue)

    // Get recent orders
    console.log('Admin dashboard: Fetching recent orders...')
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
    console.log('Admin dashboard: Recent orders fetched:', recentOrders.length)

    // Get low stock products (stock <= 2)
    console.log('Admin dashboard: Fetching low stock products...')
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
    console.log('Admin dashboard: Low stock products fetched:', lowStockProducts.length)

    console.log('Admin dashboard: Returning response')
    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders,
      lowStockProducts
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
