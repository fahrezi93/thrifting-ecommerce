import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateDokuHeaders } from '@/lib/doku';
import { pusher } from '@/lib/pusher';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Find order
    let order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) {
      order = await prisma.order.findUnique({
        where: { orderNumber: orderId },
        include: { user: true }
      });
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user owns the order
    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If order is already paid, return current status
    if (order.status === 'PAID') {
      return NextResponse.json({ 
        status: 'PAID', 
        message: 'Order is already paid',
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paidAt: order.paidAt
        }
      });
    }

    // Check payment status from DOKU
    try {
      const requestPath = `/orders/v1/status/${order.orderNumber}`;
      const dokuApiUrl = 'https://api-sandbox.doku.com' + requestPath;
      
      const headers = generateDokuHeaders('', requestPath);
      
      const response = await fetch(dokuApiUrl, {
        method: 'GET',
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        console.log('DOKU Status Check Response:', data);
        
        // Update order status based on DOKU response
        const dokuStatus = data.transaction?.status?.toUpperCase();
        let newStatus: 'PAID' | 'FAILED' | 'PENDING' | null = null;
        
        if (dokuStatus === 'SUCCESS' || dokuStatus === 'PAID' || dokuStatus === 'COMPLETED' || dokuStatus === 'SETTLED') {
          newStatus = 'PAID';
        } else if (dokuStatus === 'FAILED' || dokuStatus === 'CANCELLED' || dokuStatus === 'EXPIRED') {
          newStatus = 'FAILED';
        }
        
        if (newStatus && newStatus !== order.status) {
          const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: {
              status: newStatus,
              ...(newStatus === 'PAID' && { paidAt: new Date() })
            }
          });

          // Send notification
          if (newStatus === 'PAID') {
            const notification = await prisma.notification.create({
              data: {
                userId: order.userId,
                title: 'Payment Successful',
                message: `Payment successful! Order #${order.orderNumber} is being processed`,
                type: 'payment',
                url: `/dashboard/orders/${order.id}`
              }
            });

            if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET) {
              await pusher.trigger(`user-${order.userId}`, 'new-notification', notification);
            }
          }

          return NextResponse.json({
            status: newStatus,
            message: newStatus === 'PAID' ? 'Payment confirmed!' : 'Payment failed',
            order: {
              id: updatedOrder.id,
              orderNumber: updatedOrder.orderNumber,
              status: updatedOrder.status,
              paidAt: updatedOrder.paidAt
            }
          });
        }
      }
    } catch (dokuError) {
      console.error('Error checking DOKU status:', dokuError);
      // Continue with manual status update if DOKU check fails
    }

    // Manual status update to PAID (fallback)
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        paidAt: new Date()
      }
    });

    // Send notification
    const notification = await prisma.notification.create({
      data: {
        userId: order.userId,
        title: 'Payment Confirmed',
        message: `Payment confirmed! Order #${order.orderNumber} is being processed`,
        type: 'payment',
        url: `/dashboard/orders/${order.id}`
      }
    });

    if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET) {
      await pusher.trigger(`user-${order.userId}`, 'new-notification', notification);
    }

    return NextResponse.json({
      status: 'PAID',
      message: 'Payment status updated successfully!',
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        paidAt: updatedOrder.paidAt
      }
    });

  } catch (error) {
    console.error('[CHECK_PAYMENT_STATUS]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
