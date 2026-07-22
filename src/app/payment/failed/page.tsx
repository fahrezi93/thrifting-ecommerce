'use client'

import React, { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, RefreshCw, ShoppingBag, AlertCircle, HelpCircle } from 'lucide-react'

function PaymentFailedContent() {
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
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-sm border border-gray-100 bg-white rounded-2xl">
        <CardContent className="pt-10 pb-8 px-6 sm:px-10 flex flex-col items-center text-center">
          <div className="mb-6 rounded-full bg-red-100 p-4">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Payment Failed
          </h1>
          
          <p className="text-sm text-gray-500 mb-8 max-w-xs">
            Sorry, your payment could not be processed. Please try again or use a different payment method.
          </p>

          <div className="w-full bg-red-50/50 rounded-xl p-4 mb-8 text-left border border-red-100">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div>
                <span className="text-xs text-red-800 font-semibold block mb-1">Failure Reason</span>
                <span className="text-sm text-red-600">{getFailureReason(reason)}</span>
              </div>
            </div>
            {orderId && (
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-red-100">
                <span className="text-xs text-red-800/70 font-medium">Order ID</span>
                <span className="text-xs font-semibold text-red-900">{orderId}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full mb-6">
            <Button 
              onClick={handleRetryPayment}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={!orderId}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Payment Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/products')}
              className="w-full"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </div>

          <div className="w-full pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Still having issues?</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-gray-400">
              <span>WhatsApp: +62 812-3456-7890</span>
              <span className="hidden sm:inline">•</span>
              <span>support@thrifthaven.com</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  )
}
