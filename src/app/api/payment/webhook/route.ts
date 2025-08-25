import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verify signature for security
    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const orderId = body.order_id
    const statusCode = body.status_code
    const grossAmount = body.gross_amount
    const signatureKey = body.signature_key
    
    const hash = crypto
      .createHash('sha512')
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest('hex')
    
    if (hash !== signatureKey) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Find the order by orderNumber (not id)
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order status based on transaction status
    let newStatus = order.status
    
    switch (body.transaction_status) {
      case 'capture':
        if (body.fraud_status === 'accept') {
          newStatus = 'PAID'
        }
        break
      case 'settlement':
        newStatus = 'PAID'
        break
      case 'pending':
        newStatus = 'PENDING'
        break
      case 'deny':
      case 'cancel':
      case 'expire':
        newStatus = 'CANCELLED'
        break
      case 'failure':
        newStatus = 'CANCELLED'
        break
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    })

    // If payment is successful, reduce product stock
    if (newStatus === 'PAID' && order.status !== 'PAID') {
      for (const orderItem of order.orderItems) {
        await prisma.product.update({
          where: { id: orderItem.productId },
          data: {
            stock: {
              decrement: orderItem.quantity
            }
          }
        })
      }
    }

    console.log(`Order ${orderId} status updated to ${newStatus}`)
    
    return NextResponse.json({ message: 'Webhook processed successfully' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
