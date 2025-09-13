'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle, Package, ShoppingBag, CreditCard, Mail } from 'lucide-react'

export default function PaymentFailedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [retryCount, setRetryCount] = useState(0)

  const orderId = searchParams.get('orderId')
  const reason = searchParams.get('reason') || 'Payment was not completed'

  const handleRetryPayment = () => {
    if (orderId) {
      setRetryCount(prev => prev + 1)
      router.push(`/payment?orderId=${orderId}&retry=${retryCount + 1}`)
    }
  }

  const getFailureReason = (reason: string) => {
    const reasons: Record<string, string> = {
      'timeout': 'Payment timeout expired',
      'insufficient_funds': 'Insufficient balance',
      'invalid_payment': 'Invalid payment method',
      'cancelled': 'Payment was cancelled',
      'network_error': 'Network connection error',
      'bank_error': 'Bank system error'
    }
    return reasons[reason] || 'Payment failed to process'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Failed Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-400 to-red-600 rounded-full shadow-lg mb-6 animate-bounce">
            <XCircle className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <Badge className="inline-flex px-4 py-2 text-sm font-semibold rounded-full bg-red-50 text-red-700 border-red-200">
            FAILED
          </Badge>
        </div>

        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 h-2"></div>
          <CardHeader className="bg-white">
            <div className="text-center">
              <p className="text-lg text-gray-600 leading-relaxed">
                Sorry, your payment could not be processed. Please try again or use a different payment method.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Details */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 space-y-4 border border-red-100">
              <div className="flex items-center space-x-2 mb-4">
                <XCircle className="h-5 w-5 text-red-600" />
                <h3 className="text-xl font-bold text-gray-900">Error Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Failure Reason</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{getFailureReason(reason)}</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Time</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{new Date().toLocaleString('en-US')}</span>
                </div>
              </div>
              {orderId && (
                <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">Order ID</span>
                    <span className="text-xl font-bold font-mono text-red-600">{orderId}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Solutions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 space-y-4 border border-blue-100">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Possible Solutions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <span className="font-semibold text-gray-900">Check Balance</span>
                  </div>
                  <p className="text-sm text-gray-600">Ensure sufficient balance or credit limit</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <span className="font-semibold text-gray-900">Different Method</span>
                  </div>
                  <p className="text-sm text-gray-600">Try alternative payment method</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <span className="font-semibold text-gray-900">Check Connection</span>
                  </div>
                  <p className="text-sm text-gray-600">Ensure stable internet connection</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                    <span className="font-semibold text-gray-900">Contact Support</span>
                  </div>
                  <p className="text-sm text-gray-600">Contact your payment provider</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={handleRetryPayment}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                size="lg"
                disabled={!orderId}
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Payment Again
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/products')}
                className="flex-1 border-2 border-gray-300 hover:border-blue-500 py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                size="lg"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Continue Shopping
              </Button>
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h4 className="font-bold text-orange-800 text-lg">Still Having Issues?</h4>
              </div>
              <p className="text-orange-700 mb-4 leading-relaxed">
                Our customer service team is ready to help you 24/7
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="font-semibold text-orange-800">WhatsApp</p>
                  <p className="text-orange-700 text-sm">+62 812-3456-7890</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="font-semibold text-orange-800">Email</p>
                  <p className="text-orange-700 text-sm">support@thrifthaven.com</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="font-semibold text-orange-800">Live Chat</p>
                  <p className="text-orange-700 text-sm">Available on website</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
