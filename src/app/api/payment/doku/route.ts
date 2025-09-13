import { NextRequest, NextResponse } from 'next/server';
import { generateDokuHeaders } from '@/lib/doku';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user first
    const user = await requireAuth(req);
    
    const { orderId, amount, customerName, customerEmail } = await req.json();

    console.log('DOKU Checkout - Received orderId:', orderId);

    if (!orderId || !amount || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount, customerName, customerEmail' },
        { status: 400 }
      );
    }

    // Validate environment variables
    console.log('Environment check:', {
      hasClientId: !!process.env.DOKU_CLIENT_ID,
      hasSecretKey: !!process.env.DOKU_SECRET_KEY,
      clientIdLength: process.env.DOKU_CLIENT_ID?.length || 0
    });
    
    if (!process.env.DOKU_CLIENT_ID || !process.env.DOKU_SECRET_KEY) {
      console.error('DOKU credentials not configured');
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Get order details from database
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      console.log('Found order:', {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount
      });

      const requestPath = '/checkout/v1/payment';
      const dokuApiUrl = 'https://api-sandbox.doku.com' + requestPath;

      const body = {
        order: {
          amount: order.totalAmount,
          invoice_number: order.orderNumber,
          currency: "IDR"
        },
        payment: {
          payment_due_date: 60
        },
        customer: {
          name: customerName,
          email: customerEmail,
          phone: "08123456789",
          address: "Jakarta, Indonesia"
        }
      };

      console.log('DOKU Request Body:', JSON.stringify(body, null, 2));

      const requestBodyString = JSON.stringify(body);
      const headers = generateDokuHeaders(requestBodyString, requestPath);

      console.log('DOKU Request Headers:', headers);
      console.log('DOKU API URL:', dokuApiUrl);

      const response = await fetch(dokuApiUrl, {
        method: 'POST',
        headers: headers,
        body: requestBodyString,
      });

      const data = await response.json();

      console.log('DOKU Response Status:', response.status, response.statusText);
      console.log('DOKU Response Data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error('DOKU API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        return NextResponse.json(
          { error: data.message || data.error?.message || 'Failed to create DOKU transaction' },
          { status: response.status }
        );
      }
      
      console.log('DOKU payment created successfully:', data);
      
      // Return payment URL to frontend
      return NextResponse.json({ 
        paymentUrl: data.response?.payment?.url || data.payment_url,
        transactionId: data.response?.transaction?.id || data.transaction_id
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('[DOKU_PAYMENT_POST]', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
