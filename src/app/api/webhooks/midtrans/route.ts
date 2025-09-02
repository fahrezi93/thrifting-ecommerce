import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Define order status constants
const ORDER_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED'
} as const

type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract notification data
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      transaction_id,
      settlement_time
    } = body

    // Verify signature for security
    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const hash = crypto
      .createHash('sha512')
      .update(order_id + status_code + gross_amount + serverKey)
      .digest('hex')
    
    if (hash !== signature_key) {
      console.error('Invalid signature from Midtrans webhook')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`Midtrans webhook received for order: ${order_id}, status: ${transaction_status}`)

    // Find the order by orderNumber
    const order = await prisma.order.findUnique({
      where: { orderNumber: order_id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      console.error(`Order not found: ${order_id}`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Prevent duplicate processing
    if (order.status === ORDER_STATUS.PAID && transaction_status === 'settlement') {
      console.log(`Order ${order_id} already processed as PAID`)
      return NextResponse.json({ message: 'Order already processed' })
    }

    // Determine new order status based on transaction status
    let newStatus: OrderStatus = order.status as OrderStatus
    let paidAt: Date | null = null

    switch (transaction_status) {
      case 'capture':
        if (fraud_status === 'accept') {
          newStatus = ORDER_STATUS.PAID
          paidAt = new Date()
        }
        break
      case 'settlement':
        newStatus = ORDER_STATUS.PAID
        paidAt = settlement_time ? new Date(settlement_time) : new Date()
        break
      case 'pending':
        newStatus = ORDER_STATUS.PENDING
        break
      case 'deny':
      case 'cancel':
      case 'expire':
        newStatus = ORDER_STATUS.CANCELLED
        break
      case 'failure':
        newStatus = ORDER_STATUS.FAILED
        break
    }

    // Update order status in transaction
    await prisma.$transaction(async (tx) => {
      // Update order
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: newStatus,
          paidAt,
          midtransTransactionId: transaction_id
        }
      })

      // If payment failed or cancelled, restore product stock
      if ((newStatus === ORDER_STATUS.FAILED || newStatus === ORDER_STATUS.CANCELLED) && order.status === ORDER_STATUS.PENDING) {
        for (const orderItem of order.orderItems) {
          await tx.product.update({
            where: { id: orderItem.productId },
            data: {
              stock: {
                increment: orderItem.quantity
              }
            }
          })
        }
        console.log(`Stock restored for cancelled/failed order: ${order_id}`)
      }
    })

    console.log(`Order ${order_id} status updated from ${order.status} to ${newStatus}`)
    
    // Log the webhook for debugging
    console.log('Midtrans webhook processed:', {
      orderId: order_id,
      transactionId: transaction_id,
      oldStatus: order.status,
      newStatus,
      transactionStatus: transaction_status,
      fraudStatus: fraud_status
    })

    return NextResponse.json({ 
      message: 'Webhook processed successfully',
      orderId: order_id,
      newStatus
    })

  } catch (error) {
    console.error('Midtrans webhook error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
