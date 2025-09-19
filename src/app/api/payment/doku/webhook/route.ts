import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Force TypeScript to recognize the updated Prisma client
type PrismaClient = typeof prisma

export async function POST(request: NextRequest) {
  try {
    console.log('DOKU Webhook: Received notification')
    
    const body = await request.text()
    const signature = request.headers.get('signature')
    
    console.log('DOKU Webhook: Body received:', body)
    console.log('DOKU Webhook: Signature:', signature)
    
    // Parse the JSON body
    let data
    try {
      data = JSON.parse(body)
    } catch (error) {
      console.error('DOKU Webhook: Invalid JSON body:', error)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    
    console.log('DOKU Webhook: Parsed data:', data)
    
    // Verify signature (if DOKU provides one)
    // const isValidSignature = verifyDokuSignature(body, signature)
    // if (!isValidSignature) {
    //   console.error('DOKU Webhook: Invalid signature')
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }
    
    // Extract order information from DOKU notification
    // DOKU SNAP format uses different field names
    const {
      trxId,
      paymentRequestId,
      virtualAccountNo,
      customerNo,
      partnerServiceId,
      paidAmount,
      virtualAccountName,
      virtualAccountEmail,
      virtualAccountPhone,
      // Legacy format support
      order_id,
      invoice_number,
      amount,
      status,
      transaction_status,
      payment_channel,
      payment_code
    } = data
    
    // Determine order identifier - DOKU SNAP uses trxId, legacy uses order_id
    const orderIdentifier = trxId || order_id || paymentRequestId || invoice_number
    const paymentAmount = paidAmount?.value ? parseFloat(paidAmount.value) : (amount ? parseFloat(amount) : null)
    
    console.log('DOKU Webhook: Processing order:', orderIdentifier, 'Amount:', paymentAmount)
    
    // Find the order in our database
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: orderIdentifier },
          { id: orderIdentifier },
          { dokuTransactionId: orderIdentifier }
        ]
      }
    })
    
    if (!order) {
      console.error('DOKU Webhook: Order not found:', orderIdentifier)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    console.log('DOKU Webhook: Found order:', order.orderNumber, 'Current status:', order.status)
    
    // Determine the new status based on DOKU notification
    let newStatus = order.status
    let paidAt = order.paidAt
    
    // For DOKU SNAP, successful payment is indicated by the presence of paidAmount
    // For legacy format, check status field
    const paymentStatus = status || transaction_status
    const isPaymentSuccessful = paidAmount?.value || paymentStatus
    
    if (paidAmount?.value) {
      // DOKU SNAP format - payment successful if paidAmount exists
      newStatus = 'PAID'
      paidAt = new Date()
      console.log('DOKU Webhook: SNAP payment successful, updating to PAID')
    } else if (paymentStatus) {
      // Legacy format - check status
      switch (paymentStatus.toLowerCase()) {
        case 'success':
        case 'paid':
        case 'settlement':
        case 'capture':
          newStatus = 'PAID'
          paidAt = new Date()
          console.log('DOKU Webhook: Legacy payment successful, updating to PAID')
          break
          
        case 'pending':
        case 'challenge':
          newStatus = 'PENDING'
          console.log('DOKU Webhook: Payment pending')
          break
          
        case 'failed':
        case 'deny':
        case 'cancel':
        case 'expire':
          newStatus = 'FAILED'
          console.log('DOKU Webhook: Payment failed/cancelled')
          break
          
        default:
          console.log('DOKU Webhook: Unknown status:', paymentStatus)
          break
      }
    } else {
      console.log('DOKU Webhook: No clear payment status in notification')
    }
    
    // Update order status
    if (newStatus !== order.status) {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: newStatus,
          paidAt: paidAt,
          paymentMethod: payment_channel || order.paymentMethod,
          updatedAt: new Date()
        }
      })
      
      console.log('DOKU Webhook: Order updated successfully:', updatedOrder.orderNumber, 'New status:', newStatus)
      
      // Log the payment update (with fallback if PaymentLog model not available)
      try {
        // Check if PaymentLog model exists
        if ('paymentLog' in prisma) {
          await (prisma as any).paymentLog.create({
            data: {
              orderId: order.id,
              provider: 'DOKU',
              status: paymentStatus || 'unknown',
              amount: paymentAmount || order.totalAmount,
              response: JSON.stringify(data)
            }
          })
          console.log('DOKU Webhook: Payment log created successfully')
        } else {
          console.log('DOKU Webhook: PaymentLog model not available, skipping log creation')
        }
      } catch (logError: any) {
        console.error('DOKU Webhook: Failed to create payment log:', logError)
        // Continue processing even if logging fails
      }
      
    } else {
      console.log('DOKU Webhook: No status change needed')
    }
    
    // Return success response to DOKU
    return NextResponse.json({ 
      status: 'success',
      message: 'Webhook processed successfully',
      order_id: order.orderNumber
    })
    
  } catch (error) {
    console.error('DOKU Webhook: Error processing webhook:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Function to verify DOKU signature (implement based on DOKU documentation)
function verifyDokuSignature(body: string, signature: string | null): boolean {
  if (!signature) return true // Skip verification if no signature provided
  
  try {
    // Get appropriate secret key based on environment
    const environment = process.env.DOKU_ENVIRONMENT || 'sandbox'
    const secretKey = environment === 'production' 
      ? (process.env.DOKU_PRODUCTION_SECRET_KEY || '')
      : (process.env.DOKU_SANDBOX_SECRET_KEY || process.env.DOKU_SECRET_KEY || '')
    
    console.log('DOKU Webhook: Using', environment, 'environment for signature verification')
    
    // Implement DOKU signature verification here
    // This depends on DOKU's specific signature algorithm
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(body)
      .digest('hex')
    
    return signature === expectedSignature
  } catch (error) {
    console.error('DOKU Webhook: Signature verification error:', error)
    return false
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({ 
    message: 'DOKU Webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}
