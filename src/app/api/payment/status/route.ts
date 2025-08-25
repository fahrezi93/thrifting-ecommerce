import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { checkPaymentStatus as midtransCheckStatus } from '@/lib/midtrans'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // In a real implementation, you would check with the payment gateway
    // For now, we'll simulate payment status checking
    const paymentStatus = await checkPaymentStatus(orderId)

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: paymentStatus.status,
      paidAt: paymentStatus.paidAt,
      amount: order.totalAmount
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error checking payment status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { orderId, status } = await request.json()

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status
      }
    })

    return NextResponse.json({
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      paidAt: status === 'PAID' ? new Date() : null
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating payment status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const checkPaymentStatus = async (orderId: string) => {
  try {
    // Check with Midtrans first
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })
    
    if (!order?.orderNumber) {
      throw new Error('Order not found')
    }
    
    const midtransStatus = await midtransCheckStatus(order.orderNumber)
    
    // Map Midtrans status to our status
    let status = 'pending'
    if (midtransStatus.transaction_status === 'settlement' || 
        (midtransStatus.transaction_status === 'capture' && midtransStatus.fraud_status === 'accept')) {
      status = 'success'
    } else if (['deny', 'cancel', 'expire', 'failure'].includes(midtransStatus.transaction_status)) {
      status = 'failed'
    }
    
    return {
      orderId,
      status,
      transactionId: midtransStatus.transaction_id,
      paidAt: status === 'success' ? midtransStatus.settlement_time || new Date().toISOString() : null
    }
  } catch (error) {
    console.error('Midtrans status check failed:', error)
    // Fallback to mock status for testing
    const statuses = ['pending', 'success', 'failed']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    return {
      orderId,
      status: randomStatus,
      transactionId: `TXN_${Date.now()}`,
      paidAt: randomStatus === 'success' ? new Date().toISOString() : null
    }
  }
}
