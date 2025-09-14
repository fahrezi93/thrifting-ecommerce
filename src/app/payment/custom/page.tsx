'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard, Smartphone, Building2, Store, Wallet } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank_transfer' | 'ewallet' | 'card' | 'convenience_store' | 'digital_banking' | 'paylater';
  icon: React.ReactNode;
  description: string;
  available: boolean;
}

interface OrderData {
  orderNumber?: string;
  totalAmount?: number;
  customerName?: string;
  customerEmail?: string;
  orderItems?: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  status?: string;
  createdAt?: string;
}

const paymentMethods: PaymentMethod[] = [
  // Bank Transfer
  {
    id: 'VIRTUAL_ACCOUNT_BCA',
    name: 'BCA Virtual Account',
    type: 'bank_transfer',
    icon: <Building2 className="h-6 w-6" />,
    description: 'Transfer to BCA Virtual Account',
    available: true
  },
  {
    id: 'VIRTUAL_ACCOUNT_BANK_MANDIRI',
    name: 'Mandiri Virtual Account',
    type: 'bank_transfer',
    icon: <Building2 className="h-6 w-6" />,
    description: 'Transfer to Mandiri Virtual Account',
    available: true
  },
  {
    id: 'VIRTUAL_ACCOUNT_BRI',
    name: 'BRI Virtual Account',
    type: 'bank_transfer',
    icon: <Building2 className="h-6 w-6" />,
    description: 'Transfer to BRI Virtual Account',
    available: true
  },
  {
    id: 'VIRTUAL_ACCOUNT_BNI',
    name: 'BNI Virtual Account',
    type: 'bank_transfer',
    icon: <Building2 className="h-6 w-6" />,
    description: 'Transfer to BNI Virtual Account',
    available: true
  },
  
  // E-Wallet
  {
    id: 'EMONEY_OVO',
    name: 'OVO',
    type: 'ewallet',
    icon: <Smartphone className="h-6 w-6" />,
    description: 'Pay with OVO',
    available: true
  },
  {
    id: 'EMONEY_DANA',
    name: 'DANA',
    type: 'ewallet',
    icon: <Smartphone className="h-6 w-6" />,
    description: 'Pay with DANA',
    available: true
  },
  {
    id: 'EMONEY_SHOPEEPAY',
    name: 'ShopeePay',
    type: 'ewallet',
    icon: <Smartphone className="h-6 w-6" />,
    description: 'Pay with ShopeePay',
    available: true
  },
  {
    id: 'DOKU_WALLET',
    name: 'DOKU Wallet',
    type: 'ewallet',
    icon: <Wallet className="h-6 w-6" />,
    description: 'Pay with DOKU Wallet',
    available: true
  },
  
  // Credit Card
  {
    id: 'CREDIT_CARD',
    name: 'Credit Card',
    type: 'card',
    icon: <CreditCard className="h-6 w-6" />,
    description: 'Visa, Mastercard, JCB, AMEX',
    available: true
  },
  
  // Convenience Store
  {
    id: 'ONLINE_TO_OFFLINE_ALFA',
    name: 'Alfamart',
    type: 'convenience_store',
    icon: <Store className="h-6 w-6" />,
    description: 'Pay at nearest Alfamart',
    available: true
  },
  {
    id: 'ONLINE_TO_OFFLINE_INDOMARET',
    name: 'Indomaret',
    type: 'convenience_store',
    icon: <Store className="h-6 w-6" />,
    description: 'Pay at nearest Indomaret',
    available: true
  },
  
  // PayLater
  {
    id: 'PEER_TO_PEER_KREDIVO',
    name: 'Kredivo',
    type: 'paylater',
    icon: <CreditCard className="h-6 w-6" />,
    description: 'Installment with Kredivo',
    available: true
  },
  {
    id: 'PEER_TO_PEER_INDODANA',
    name: 'Indodana',
    type: 'paylater',
    icon: <CreditCard className="h-6 w-6" />,
    description: 'Installment with Indodana',
    available: true
  }
];

const getTypeColor = (type: PaymentMethod['type']) => {
  switch (type) {
    case 'bank_transfer': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'ewallet': return 'bg-green-50 text-green-700 border-green-200';
    case 'card': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'convenience_store': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'paylater': return 'bg-pink-50 text-pink-700 border-pink-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getTypeLabel = (type: PaymentMethod['type']) => {
  switch (type) {
    case 'bank_transfer': return 'Bank Transfer';
    case 'ewallet': return 'E-Wallet';
    case 'card': return 'Credit Card';
    case 'convenience_store': return 'Convenience Store';
    case 'paylater': return 'PayLater';
    default: return 'Others';
  }
};

export default function CustomPaymentPage() {
  const { user, loading: authLoading } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Wait for auth to load first
    if (authLoading) return;
    
    // Get order data from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (orderId && user) {
      // Fetch order data
      fetchOrderData(orderId);
    } else if (!user) {
      setError('Please login to continue');
      setLoading(false);
    } else {
      setError('Order ID not found');
      setLoading(false);
    }

    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [authLoading, user]);

  const fetchOrderData = async (orderId: string) => {
    try {
      console.log('Fetching order data for:', orderId);
      
      if (!user || !user.getIdToken) {
        console.error('User not authenticated');
        throw new Error('User not authenticated');
      }
      
      // Get Firebase auth token
      const token = await user.getIdToken();
      console.log('Auth token obtained:', token ? 'Yes' : 'No');
      
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        
        if (response.status === 404) {
          setError('Order not found. Please check order ID or create a new order.');
        } else if (response.status === 403) {
          setError('You do not have access to this order.');
        } else {
          setError(`Failed to load order data: ${errorData.error || 'Unknown error'}`);
        }
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log('Order data received:', data);
      
      // Check if order is already paid
      if (data.status === 'PAID') {
        setError('This order has already been paid. Please check order status in your dashboard.');
        setLoading(false);
        return;
      }
      
      setOrderData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch order data:', error);
      setError('Failed to load order data. Please try again.');
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePayment = async () => {
    if (!selectedMethod || !orderData || !orderData.orderNumber) return;

    setIsProcessing(true);
    
    try {
      if (!user || !user.getIdToken) {
        throw new Error('User not authenticated');
      }
      
      // Get Firebase auth token
      const token = await user.getIdToken();
      console.log('Payment: Auth token obtained:', token ? 'Yes' : 'No');
      
      // First, check if order is already paid
      console.log('Checking payment status before processing...');
      const statusResponse = await fetch(`/api/orders/${orderData.orderNumber}/poll-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderData.orderNumber
        }),
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('Payment status check result:', statusData);
        
        if (statusData.statusUpdated && statusData.newStatus === 'PAID') {
          alert('Payment successful! Order status has been updated to PAID.');
          window.location.href = '/dashboard/orders';
          return;
        }
      }
      
      const response = await fetch('/api/payment/doku/direct', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderData?.orderNumber || '',
          paymentMethod: selectedMethod,
        }),
      });
      
      console.log('Payment: Response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError);
          const textResponse = await response.text();
          console.error('Raw error response:', textResponse);
          alert(`Payment failed: ${textResponse || 'Unknown error'}`);
          return;
        }
        console.error('Payment API Error Response:', errorData);
        
        // If invoice already used, check status and redirect
        if (errorData.error && errorData.error.includes('INVOICE ALREADY USED')) {
          console.log('Invoice already used, checking payment status...');
          
          // Check status again
          const statusResponse = await fetch(`/api/orders/${orderData.orderNumber}/poll-status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: orderData.orderNumber
            }),
          });

          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            if (statusData.statusUpdated && statusData.newStatus === 'PAID') {
              alert('Payment successful! Order status has been updated to PAID.');
              window.location.href = '/dashboard/orders';
              return;
            }
          }
          
          alert('This order has already been paid. Please check order status in your dashboard.');
          window.location.href = '/dashboard/orders';
          return;
        }
        
        alert(`Payment failed: ${errorData.error || 'Unknown error'}`);
        return;
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse success response as JSON:', jsonError);
        const textResponse = await response.text();
        console.error('Raw success response:', textResponse);
        alert(`Payment response error: Invalid response format`);
        return;
      }
      console.log('Payment: Response data:', data);
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.error) {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(`Error occurred while processing payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const groupedMethods = paymentMethods.reduce((acc, method) => {
    if (!acc[method.type]) {
      acc[method.type] = [];
    }
    acc[method.type].push(method);
    return acc;
  }, {} as Record<string, PaymentMethod[]>);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Coba Lagi
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/dashboard/orders'}
              className="w-full"
            >
              Kembali ke Orders
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/checkout'}
              className="w-full"
            >
              Buat Order Baru
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Payment Method
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span>Complete payment within</span>
            <Badge variant="destructive" className="font-mono">
              {formatTime(timeLeft)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Choose Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(groupedMethods).map(([type, methods]) => (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getTypeLabel(type as PaymentMethod['type'])}
                      </h3>
                      <Badge variant="outline" className={getTypeColor(type as PaymentMethod['type'])}>
                        {methods.length} methods
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {methods.map((method) => (
                        <div
                          key={method.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedMethod === method.id
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => method.available && setSelectedMethod(method.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getTypeColor(method.type)}`}>
                              {method.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{method.name}</h4>
                              <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                            {selectedMethod === method.id && (
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {type !== Object.keys(groupedMethods)[Object.keys(groupedMethods).length - 1] && (
                      <Separator className="my-6" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">No. Invoice</span>
                    <span className="font-mono text-gray-900">{orderData.orderNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Name</span>
                    <span className="text-gray-900">{orderData.customerName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Email</span>
                    <span className="text-gray-900">{orderData.customerEmail || 'N/A'}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">IDR {(orderData.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Payment</span>
                    <span className="text-blue-600">IDR {(orderData.totalAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handlePayment}
                  disabled={!selectedMethod || isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Continue Payment'
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  By continuing, you agree to the payment terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}