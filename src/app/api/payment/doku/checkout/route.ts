import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateDokuHeaders } from '@/lib/doku';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    const { orderId } = await req.json();
    console.log('DOKU Checkout - Received orderId:', orderId);
    
    if (!orderId) {
      return new NextResponse('Order ID is required', { status: 400 });
    }

    // Validate environment variables
    console.log('Environment check:', {
      hasClientId: !!process.env.DOKU_CLIENT_ID,
      hasSecretKey: !!process.env.DOKU_SECRET_KEY,
      clientIdLength: process.env.DOKU_CLIENT_ID?.length || 0,
      secretKeyLength: process.env.DOKU_SECRET_KEY?.length || 0,
      clientIdPrefix: process.env.DOKU_CLIENT_ID?.substring(0, 10) || 'N/A'
    });
    
    if (!process.env.DOKU_CLIENT_ID || !process.env.DOKU_SECRET_KEY) {
      console.error('DOKU credentials not configured');
      return new NextResponse('Payment gateway not configured', { status: 500 });
    }

    // Validasi format Client ID (harus dimulai dengan BRN-)
    if (!process.env.DOKU_CLIENT_ID.startsWith('BRN-')) {
      console.error('Invalid DOKU Client ID format. Should start with BRN-');
      return new NextResponse('Invalid payment gateway configuration', { status: 500 });
    }

    // Validasi Secret Key (harus ada dan tidak kosong)
    if (!process.env.DOKU_SECRET_KEY || process.env.DOKU_SECRET_KEY.trim().length === 0) {
      console.error('DOKU Secret Key is empty or invalid');
      return new NextResponse('Invalid payment gateway configuration', { status: 500 });
    }

    // Ambil detail order dari database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
      },
    });

    console.log('Found order:', order ? { id: order.id, orderNumber: order.orderNumber, totalAmount: order.totalAmount } : 'null');

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    // Check if order is already paid
    if (order.status === 'PAID') {
      console.log(`Order ${orderId} is already paid, preventing duplicate payment`);
      return NextResponse.json(
        { 
          error: 'Order already paid',
          message: 'This order has already been paid. Please check your order status in the dashboard.',
          orderStatus: 'PAID',
          paidAt: order.paidAt
        },
        { status: 400 }
      );
    }

    // Check if order belongs to the authenticated user
    if (order.userId !== user.id) {
      return new NextResponse('Unauthorized access to order', { status: 403 });
    }

    // Path dan URL API DOKU Sandbox
    const requestPath = '/checkout/v1/payment';
    const dokuApiUrl = 'https://api-sandbox.doku.com' + requestPath;

    // Validasi data order sebelum membuat request
    if (!order.orderNumber || !order.totalAmount || !order.user.email) {
      console.error('Missing required order data:', {
        hasOrderNumber: !!order.orderNumber,
        hasTotalAmount: !!order.totalAmount,
        hasUserEmail: !!order.user.email,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        userEmail: order.user.email
      });
      return new NextResponse('Invalid order data', { status: 400 });
    }

    // Susun body request HANYA dengan field yang paling wajib
    // Pastikan amount berupa integer tanpa decimal (sesuai dokumentasi DOKU)
    const body = {
      order: {
        invoice_number: order.orderNumber,
        amount: Math.floor(order.totalAmount), // Pastikan integer tanpa decimal
      },
      payment: {
        payment_due_date: 60,
      },
      customer: {
        name: order.user.name || 'Thrifting User',
        email: order.user.email,
      },
    };

    // Validasi format JSON sebelum dikirim
    try {
      JSON.stringify(body);
    } catch (jsonError) {
      console.error('Invalid JSON format:', jsonError);
      return new NextResponse('Invalid request data format', { status: 400 });
    }

    const requestBodyString = JSON.stringify(body);
    console.log("DOKU Final Minimal Request Body:", requestBodyString); // Tambahkan log ini
    // Gunakan helper yang sudah kita buat
    const headers = generateDokuHeaders(requestBodyString, requestPath);
    
    console.log('DOKU Request Headers:', headers);
    console.log('DOKU API URL:', dokuApiUrl);

    // Kirim request ke DOKU
    const response = await fetch(dokuApiUrl, {
      method: 'POST',
      headers: headers,
      body: requestBodyString,
    });

    console.log('DOKU Response Status:', response.status, response.statusText);
    console.log('DOKU Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('DOKU Raw Response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('DOKU Parsed Response Data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('Failed to parse DOKU response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response from payment gateway', rawResponse: responseText },
        { status: 500 }
      );
    }

    if (!response.ok) {
        console.error('DOKU API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          headers: Object.fromEntries(response.headers.entries())
        });
        return NextResponse.json(
          { error: data.message || data.error?.message || 'Failed to create DOKU transaction' },
          { status: response.status }
        );
    }
    
    // Kembalikan URL pembayaran ke frontend
    return NextResponse.json({ paymentUrl: data.response.payment.url });

  } catch (error) {
    console.error('[DOKU_CHECKOUT_POST]', error);
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
