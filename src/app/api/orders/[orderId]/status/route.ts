import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { orderId, status } = await req.json();
    console.log('Manual status update request:', { orderId, status });
    
    if (!orderId || !status) {
      return new NextResponse('Order ID and status are required', { status: 400 });
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
      include: { user: true }
    });

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    // For now, allow status update without auth validation
    // In production, you might want to add proper authentication

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: status,
        ...(status === 'PAID' && { paidAt: new Date() })
      }
    });

    console.log('Order status updated manually:', {
      orderId: order.orderNumber,
      oldStatus: order.status,
      newStatus: status,
      userId: order.userId
    });

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        paidAt: updatedOrder.paidAt
      }
    });

  } catch (error) {
    console.error('[MANUAL_STATUS_UPDATE]', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}