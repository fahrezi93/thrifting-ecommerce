'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, ArrowLeft, Package, ShoppingBag, CreditCard, Mail } from 'lucide-react';

export default function PaymentSuccessPage() {
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
        return <CheckCircle className="h-16 w-16 text-white" />;
      case 'pending':
        return <Clock className="h-16 w-16 text-white" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-white" />;
      default:
        return <CheckCircle className="h-16 w-16 text-white" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-green-50 text-green-700 border-green-200';
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
        return 'Thank you! Your payment has been successfully processed. Your order will be shipped soon.';
      case 'pending':
        return 'Your payment is being processed. Please wait for confirmation or complete the payment if not yet done.';
      case 'failed':
        return 'Sorry, your payment failed to process. Please try again or use a different payment method.';
      default:
        return 'Thank you! Your payment has been successfully processed.';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-xl mb-6 animate-bounce">
            {getStatusIcon()}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {getStatusText()}
          </h1>
          <Badge className={`inline-flex px-6 py-2 text-base font-semibold rounded-full ${getStatusColor()}`}>
            {status.toUpperCase()}
          </Badge>
        </div>

        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-3"></div>
          <CardHeader className="bg-white px-8 py-6">
            <div className="text-center">
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                {getStatusDescription()}
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="px-8 py-6 space-y-8">
            {paymentData && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 space-y-6 border border-green-100 shadow-sm">
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Invoice Number</span>
                    </div>
                    <span className="font-mono text-xl font-bold text-gray-900">{paymentData.orderNumber}</span>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Mail className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Customer Info</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-gray-900">{paymentData.customerName}</p>
                      <p className="text-sm text-gray-600">{paymentData.customerEmail}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-green-100 text-sm font-medium uppercase tracking-wide mb-1">Total Amount Paid</p>
                      <p className="text-3xl font-bold">IDR {paymentData.totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-6 pt-6">
              <Button 
                onClick={() => router.push('/dashboard/orders')}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-4 px-8 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                size="lg"
              >
                <Package className="mr-3 h-6 w-6" />
                <span className="text-lg font-semibold">View My Orders</span>
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/products')}
                className="flex-1 border-2 border-green-300 hover:border-green-500 hover:bg-green-50 text-green-700 py-4 px-8 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                size="lg"
              >
                <ShoppingBag className="mr-3 h-6 w-6" />
                <span className="text-lg font-semibold">Continue Shopping</span>
              </Button>
            </div>

            {status === 'pending' && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-bold text-yellow-800 text-lg">Payment Instructions</h4>
                </div>
                <p className="text-yellow-700 leading-relaxed">
                  Please complete your payment according to the provided instructions. 
                  Once payment is successful, your order will be automatically confirmed.
                </p>
              </div>
            )}

            {status === 'failed' && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <h4 className="font-bold text-red-800 text-lg">Try Again</h4>
                </div>
                <p className="text-red-700 mb-4 leading-relaxed">
                  If payment failed, you can try again with a different payment method.
                </p>
                <Button 
                  onClick={() => router.push(`/payment/custom?orderId=${orderId}`)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                  size="lg"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Try Payment Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}