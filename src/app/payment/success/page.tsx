'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status') || 'success';

  useEffect(() => {
    if (orderId) {
      fetchPaymentData(orderId);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchPaymentData = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentData(data);
      }
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-10 w-10 text-green-600" />;
      case 'pending':
        return <Clock className="h-10 w-10 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-10 w-10 text-red-600" />;
      default:
        return <CheckCircle className="h-10 w-10 text-green-600" />;
    }
  };

  const getIconBackground = () => {
    switch (status) {
      case 'success':
        return 'bg-green-100';
      case 'pending':
        return 'bg-yellow-100';
      case 'failed':
        return 'bg-red-100';
      default:
        return 'bg-green-100';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Payment Successful';
      case 'pending':
        return 'Payment Pending';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Payment Successful';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'success':
        return 'Thank you for your purchase. Your payment has been processed successfully.';
      case 'pending':
        return 'Your payment is being processed. Please wait for confirmation.';
      case 'failed':
        return 'Sorry, your payment failed to process. Please try again.';
      default:
        return 'Thank you for your purchase. Your payment has been processed successfully.';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-sm border border-gray-100 bg-white rounded-2xl">
        <CardContent className="pt-10 pb-8 px-6 sm:px-10 flex flex-col items-center text-center">
          <div className={`mb-6 rounded-full p-4 ${getIconBackground()}`}>
            {getStatusIcon()}
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {getStatusText()}
          </h1>
          
          <p className="text-sm text-gray-500 mb-8 max-w-xs">
            {getStatusDescription()}
          </p>

          {paymentData && (
            <div className="w-full bg-gray-50 rounded-xl p-4 mb-8 text-left border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 font-medium">Order Number</span>
                <span className="text-xs font-semibold text-gray-900">{paymentData.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 font-medium">Amount Paid</span>
                <span className="text-xs font-semibold text-gray-900">
                  IDR {paymentData.totalAmount?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">Customer</span>
                <span className="text-xs font-semibold text-gray-900 truncate max-w-[150px]">
                  {paymentData.customerEmail}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 w-full">
            {status === 'failed' ? (
              <Button 
                onClick={() => router.push(`/payment/custom?orderId=${orderId}`)}
                className="w-full"
              >
                Try Payment Again
              </Button>
            ) : (
              <Button 
                onClick={() => router.push('/dashboard/orders')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                View Order Details
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={() => router.push('/products')}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}