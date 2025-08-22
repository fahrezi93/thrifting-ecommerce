import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    // Get total counts
    const [totalProducts, totalOrders, totalUsers] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count(),
    ])

    // Get total revenue from completed orders
    const revenueResult = await prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalAmount: true }
    })
    const totalRevenue = Number(revenueResult._sum.totalAmount) || 0

    // Get recent orders
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

    // Get low stock products (stock <= 2)
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
