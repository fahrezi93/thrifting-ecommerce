import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyIdToken } from '@/lib/firebase-admin'

// GET - Fetch user statistics
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decodedToken = await verifyIdToken(token)
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user statistics
    const [orders, wishlistCount] = await Promise.all([
      // Get all orders for the user
      prisma.order.findMany({
        where: { userId: decodedToken.uid },
        include: {
          orderItems: true
        }
      }),
      // Get wishlist items count
      prisma.wishlistItem.count({
        where: { userId: decodedToken.uid }
      })
    ])

    // Calculate statistics
    const totalOrders = orders.length
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const itemsSaved = wishlistCount

    // Get recent orders for additional info
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        itemCount: order.orderItems.length
      }))

    const statistics = {
      totalOrders,
      totalSpent,
      itemsSaved,
      recentOrders,
      // Additional stats
      averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
      completedOrders: orders.filter(order => order.status === 'DELIVERED').length,
      pendingOrders: orders.filter(order => ['PENDING', 'PROCESSING', 'PAID', 'SHIPPED'].includes(order.status)).length
    }

    return NextResponse.json(statistics)
  } catch (error) {
    console.error('Error fetching user statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
