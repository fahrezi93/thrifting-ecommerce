import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const user = await requireAuth(req);
    const orderId = params.orderId;
    
    console.log('API: Getting order data for:', orderId);
    console.log('API: User authenticated:', user.id);
    
    // Get order details - try both id and orderNumber
    let order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        shippingAddress: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    // If not found by id, try by orderNumber
    if (!order) {
      order = await prisma.order.findUnique({
        where: { orderNumber: orderId },
        include: {
          user: true,
          shippingAddress: true,
          orderItems: {
            include: {
              product: true
            }
          }
        }
      });
    }

    console.log('API: Searching for order with id/orderNumber:', orderId);
    console.log('API: Order found:', order ? 'Yes' : 'No');

    if (!order) {
      console.log('API: Order not found');
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Validate order belongs to user
    if (order.userId !== user.id) {
      console.log('API: Order does not belong to user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Format order data for frontend
    const orderData = {
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      customerName: order.user.name || 'Unknown',
      customerEmail: order.user.email || '',
      orderItems: order.orderItems.map(item => ({
        id: item.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      status: order.status,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod
    };

    console.log('API: Order data formatted successfully');
    return NextResponse.json(orderData);

  } catch (error) {
    console.error('[GET_ORDER_DETAILS]', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}