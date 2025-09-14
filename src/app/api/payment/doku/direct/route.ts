import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateDokuHeaders } from '@/lib/doku';

export async function POST(req: NextRequest) {
  try {
    console.log('DOKU Direct API - Starting request');
    
    const user = await requireAuth(req);
    console.log('DOKU Direct API - User authenticated:', user.id);
    
    const { orderId, paymentMethod } = await req.json();
    console.log('DOKU Direct API - Received:', { orderId, paymentMethod });
    
    if (!orderId || !paymentMethod) {
      return new NextResponse('Order ID and Payment Method are required', { status: 400 });
    }

    // Validate environment variables
    console.log('DOKU Environment Check:', {
      hasClientId: !!process.env.DOKU_CLIENT_ID,
      hasSecretKey: !!process.env.DOKU_SECRET_KEY,
      clientIdLength: process.env.DOKU_CLIENT_ID?.length || 0,
      secretKeyLength: process.env.DOKU_SECRET_KEY?.length || 0,
      clientIdPrefix: process.env.DOKU_CLIENT_ID?.substring(0, 10) || 'N/A',
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL
    });
    
    if (!process.env.DOKU_CLIENT_ID || !process.env.DOKU_SECRET_KEY) {
      console.error('DOKU credentials not configured');
      return new NextResponse('Payment gateway not configured', { status: 500 });
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true
          }
        }
      },
    });

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

    // Prepare request body based on payment method
    const requestBody = await prepareRequestBody(order, paymentMethod);
    
    // Get API endpoint based on payment method
    const { endpoint, path } = getApiEndpoint(paymentMethod);
    
    console.log('DOKU Direct API Request:', {
      endpoint,
      path,
      body: requestBody
    });
    
    console.log('DOKU Direct API - Order Details:', {
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      customerName: order.user.name,
      customerEmail: order.user.email,
      customerPhone: order.user.phone
    });

    const requestBodyString = JSON.stringify(requestBody);
    const headers = generateDokuHeaders(requestBodyString, path);

    // Make request to DOKU
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: requestBodyString,
    });

    console.log('DOKU Direct API Response Status:', response.status);
    
    const responseText = await response.text();
    console.log('DOKU Direct API Raw Response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse DOKU response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response from payment gateway', rawResponse: responseText },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error('DOKU Direct API Error:', data);
      
      // Handle specific DOKU error messages
      let errorMessage = 'Payment gateway error';
      if (data && typeof data === 'object') {
        errorMessage = data.message || data.error?.message || data.response?.message || 'Failed to create payment';
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          dokuResponse: data,
          statusCode: response.status
        },
        { status: 500 } // Always return 500 for client to handle consistently
      );
    }

    // Update order with payment method (don't change status yet, wait for webhook)
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: paymentMethod,
        // Status will be updated by webhook when payment is actually completed
      }
    });

    // Return appropriate response based on payment method
    return NextResponse.json({
      success: true,
      paymentData: data,
      paymentUrl: getPaymentUrl(data, paymentMethod),
      paymentMethod: paymentMethod,
      orderId: order.orderNumber // Include order ID for frontend
    });

  } catch (error) {
    console.error('[DOKU_DIRECT_API_POST]', error);
    
    // Ensure we always return valid JSON
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Payment processing failed',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

async function prepareRequestBody(order: any, paymentMethod: string) {
  const baseBody = {
    order: {
      invoice_number: order.orderNumber,
      amount: Math.floor(order.totalAmount),
      currency: "IDR",
      callback_url: process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success` : 'http://localhost:3000/payment/success',
      callback_url_cancel: process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel` : 'http://localhost:3000/payment/cancel',
    },
    customer: {
      id: order.user.id,
      name: order.user.name || 'Customer',
      email: order.user.email,
      phone: order.user.phone || '08123456789',
      address: order.shippingAddress || 'Jakarta, Indonesia',
      postcode: '12000',
      state: 'Jakarta',
      city: 'Jakarta',
      country: 'ID'
    },
    additional_info: {
      allow_tenor: [0, 3, 6, 12],
    }
  };

  // Add payment method specific data
  switch (paymentMethod) {
    case 'CREDIT_CARD':
      return {
        ...baseBody,
        payment: {
          payment_due_date: 60,
          payment_method_types: ['CREDIT_CARD']
        }
      };

    case 'VIRTUAL_ACCOUNT_BCA':
    case 'VIRTUAL_ACCOUNT_BANK_MANDIRI':
    case 'VIRTUAL_ACCOUNT_BRI':
    case 'VIRTUAL_ACCOUNT_BNI':
      return {
        ...baseBody,
        payment: {
          payment_due_date: 60,
          payment_method_types: [paymentMethod]
        }
      };

    case 'EMONEY_OVO':
    case 'EMONEY_DANA':
    case 'EMONEY_SHOPEEPAY':
    case 'DOKU_WALLET':
      return {
        ...baseBody,
        payment: {
          payment_due_date: 60,
          payment_method_types: [paymentMethod]
        }
      };

    case 'ONLINE_TO_OFFLINE_ALFA':
    case 'ONLINE_TO_OFFLINE_INDOMARET':
      return {
        ...baseBody,
        payment: {
          payment_due_date: 60,
          payment_method_types: [paymentMethod]
        }
      };

    case 'PEER_TO_PEER_KREDIVO':
    case 'PEER_TO_PEER_INDODANA':
      return {
        ...baseBody,
        payment: {
          payment_due_date: 60,
          payment_method_types: [paymentMethod]
        },
        customer: {
          ...baseBody.customer,
          address: order.shippingAddress || 'Jakarta, Indonesia',
          postcode: '12000',
          state: 'Jakarta',
          city: 'Jakarta',
          country: 'ID'
        }
      };

    default:
      return {
        ...baseBody,
        payment: {
          payment_due_date: 60,
          payment_method_types: [paymentMethod]
        }
      };
  }
}

function getApiEndpoint(paymentMethod: string) {
  const baseUrl = 'https://api-sandbox.doku.com';
  
  // For most payment methods, use the checkout API
  if (paymentMethod.startsWith('VIRTUAL_ACCOUNT_') || 
      paymentMethod.startsWith('EMONEY_') || 
      paymentMethod === 'CREDIT_CARD' ||
      paymentMethod.startsWith('ONLINE_TO_OFFLINE_') ||
      paymentMethod.startsWith('PEER_TO_PEER_')) {
    return {
      endpoint: `${baseUrl}/checkout/v1/payment`,
      path: '/checkout/v1/payment'
    };
  }

  // Default to checkout API
  return {
    endpoint: `${baseUrl}/checkout/v1/payment`,
    path: '/checkout/v1/payment'
  };
}

function getPaymentUrl(responseData: any, paymentMethod: string) {
  // Extract payment URL from response based on payment method
  if (responseData.response?.payment?.url) {
    return responseData.response.payment.url;
  }
  
  if (responseData.payment?.url) {
    return responseData.payment.url;
  }
  
  if (responseData.url) {
    return responseData.url;
  }

  // For virtual accounts, return the account number
  if (paymentMethod.startsWith('VIRTUAL_ACCOUNT_')) {
    return responseData.response?.virtual_account?.account_number || 
           responseData.virtual_account?.account_number;
  }

  return null;
}