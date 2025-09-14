import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkDokuTransactionStatus } from '@/lib/doku';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    console.log('Polling DOKU transaction status for order:', orderId);
    
    if (!orderId) {
      return new NextResponse('Order ID is required', { status: 400 });
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
      include: { user: true }
    });

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    // Check transaction status from DOKU
    try {
      const transactionStatus = await checkDokuTransactionStatus(order.id);
      console.log('DOKU transaction status:', transactionStatus);

      if (transactionStatus) {
        const { status, transactionId } = transactionStatus;
        
        // Update order status based on DOKU response
        let newStatus: 'PAID' | 'FAILED' | null = null;
        if (status === 'SUCCESS' || status === 'PAID' || status === 'COMPLETED' || status === 'SETTLED') {
          newStatus = 'PAID';
        } else if (status === 'FAILED' || status === 'CANCELLED' || status === 'EXPIRED') {
          newStatus = 'FAILED';
        }

        if (newStatus && newStatus !== order.status) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: newStatus,
              ...(newStatus === 'PAID' && { paidAt: new Date() }),
            },
          });

          console.log(`Order ${orderId} status updated via polling from ${order.status} to ${newStatus}`);

          return NextResponse.json({
            success: true,
            statusUpdated: true,
            oldStatus: order.status,
            newStatus: newStatus,
            transactionId: transactionId,
            dokuStatus: status
          });
        } else {
          return NextResponse.json({
            success: true,
            statusUpdated: false,
            currentStatus: order.status,
            dokuStatus: status
          });
        }
      } else {
        // If we can't get status from DOKU, check if order might already be paid
        // by looking for any successful payment records
        console.log('Could not get DOKU status, checking if order might be paid...');
        
        // For now, return current status
        return NextResponse.json({
          success: true,
          statusUpdated: false,
          currentStatus: order.status,
          dokuStatus: 'UNKNOWN',
          message: 'Could not verify payment status with DOKU'
        });
      }
    } catch (dokuError) {
      console.error('Error checking DOKU transaction status:', dokuError);
      
      // Even if DOKU check fails, return current status
      return NextResponse.json({
        success: true,
        statusUpdated: false,
        currentStatus: order.status,
        dokuStatus: 'ERROR',
        message: 'Failed to check transaction status with DOKU'
      });
    }

    return NextResponse.json({
      success: true,
      statusUpdated: false,
      currentStatus: order?.status || 'UNKNOWN'
    });

  } catch (error) {
    console.error('[POLL_DOKU_STATUS]', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}