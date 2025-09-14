import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyDokuSignature } from '@/lib/doku';
import { pusher } from '@/lib/pusher';

export async function POST(req: NextRequest) {
  try {
    console.log('=== DOKU WEBHOOK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    
    const bodyText = await req.text();
    console.log('Raw Body Text:', bodyText);
    
    const bodyJson = JSON.parse(bodyText);
    console.log('Parsed Body JSON:', JSON.stringify(bodyJson, null, 2));
    
    const headers = req.headers;
    const signature = headers.get('Signature');
    const clientId = headers.get('Client-Id');
    const requestId = headers.get('Request-Id');
    const requestTimestamp = headers.get('Request-Timestamp');

    // Log all received headers for debugging
    console.log('DOKU Webhook Headers:', {
      signature: signature || 'MISSING',
      clientId: clientId || 'MISSING',
      requestId: requestId || 'MISSING',
      requestTimestamp: requestTimestamp || 'MISSING'
    });

    if (!signature || !clientId || !requestId || !requestTimestamp) {
      console.error('❌ Missing required headers from DOKU webhook');
      return NextResponse.json({ error: 'Missing required headers' }, { status: 400 });
    }

    // 1. Verifikasi Signature
    console.log('🔐 Starting signature verification...');
    const isVerified = verifyDokuSignature(
      signature, 
      bodyText, 
      clientId, 
      requestId, 
      requestTimestamp
    );

    if (!isVerified) {
      console.error('❌ DOKU Webhook: Invalid signature. Verification failed.');
      console.error('Signature verification details:', {
        receivedSignature: signature,
        clientId,
        requestId,
        requestTimestamp,
        bodyLength: bodyText.length
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log('✅ DOKU Webhook: Signature verified successfully!');

    // 2. Proses Notifikasi
    const { transaction, order } = bodyJson;
    const invoiceNumber = order.invoice_number; // This should match our orderNumber
    const status = transaction.status.toUpperCase(); // PAID, FAILED, etc.
    const transactionId = transaction.id;
    
    console.log('📋 DOKU Webhook - Processing transaction:', {
      invoiceNumber,
      status,
      transactionId,
      fullOrderData: order,
      fullTransactionData: transaction
    });

    // 3. Find order in database
    console.log(`🔍 Searching for order with orderNumber: ${invoiceNumber}`);
    
    // Try to find order by both id and orderNumber for backward compatibility
    let existingOrder = await prisma.order.findFirst({
      where: { 
        OR: [
          { id: invoiceNumber },
          { orderNumber: invoiceNumber }
        ]
      },
      include: { user: true }
    });

    if (!existingOrder) {
      console.error(`❌ Order with ID/orderNumber ${invoiceNumber} not found in database`);
      console.log('Available orders in database (last 5):');
      
      // Log recent orders for debugging
      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, orderNumber: true, status: true, createdAt: true }
      });
      console.log('Recent orders:', recentOrders);
      
      return NextResponse.json({ 
        error: `Order with ID/orderNumber ${invoiceNumber} not found`,
        searchedFor: invoiceNumber,
        recentOrders: recentOrders.map(o => ({ id: o.id, orderNumber: o.orderNumber }))
      }, { status: 404 });
    }

    console.log(`✅ Order found in database:`, {
      id: existingOrder.id,
      orderNumber: existingOrder.orderNumber,
      currentStatus: existingOrder.status,
      userId: existingOrder.userId,
      createdAt: existingOrder.createdAt
    });

    // 4. Update order status in database
    console.log('🔄 Processing status update...');
    console.log('Current order status:', existingOrder.status);
    console.log('New transaction status from DOKU:', status);
    
    // Mapping status DOKU ke status internal
    let newStatus: 'PAID' | 'FAILED' | 'PENDING' | null = null;
    if (status === 'SUCCESS' || status === 'PAID' || status === 'COMPLETED' || status === 'SETTLED') {
      newStatus = 'PAID';
    } else if (status === 'FAILED' || status === 'CANCELLED' || status === 'EXPIRED') {
      newStatus = 'FAILED';
    } else if (status === 'PENDING' || status === 'PROCESSING') {
      newStatus = 'PENDING';
    }
    
    console.log('Mapped status:', newStatus);
    
    if (newStatus && newStatus !== existingOrder.status) {
      console.log(`📝 Updating order ${invoiceNumber} status from ${existingOrder.status} to ${newStatus}`);
      
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          status: newStatus,
          ...(newStatus === 'PAID' && { paidAt: new Date() }),
        },
      });

      console.log(`✅ Order ${invoiceNumber} status successfully updated to ${newStatus}`);

      // 5. Send real-time notification via Pusher
      if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET) {
        try {
          let notificationMessage = '';
          if (newStatus === 'PAID') {
            notificationMessage = `Payment successful! Order #${existingOrder.orderNumber} is being processed`;
          } else if (newStatus === 'FAILED') {
            notificationMessage = `Payment failed for order #${existingOrder.orderNumber}. Please try again`;
          }
          
          if (notificationMessage) {
            const notification = await prisma.notification.create({
              data: {
                userId: existingOrder.userId,
                message: notificationMessage,
                url: `/dashboard/orders/${existingOrder.id}`
              }
            });

            await pusher.trigger(`user-${existingOrder.userId}`, 'new-notification', notification);
            console.log(`📱 Notification sent to user ${existingOrder.userId} for order ${invoiceNumber} (${newStatus})`);
          }
        } catch (notificationError) {
          console.error('❌ Error sending payment notification:', notificationError);
        }
      } else {
        console.log('⚠️ Pusher not configured, skipping real-time notification');
      }
      
    } else {
      console.log(`ℹ️ Order ${invoiceNumber} status unchanged (${existingOrder.status})`);
    }
    
    // Balas DOKU dengan status 200 OK untuk menandakan notifikasi berhasil diterima
    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

  } catch (error) {
    console.error('[DOKU_WEBHOOK_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
