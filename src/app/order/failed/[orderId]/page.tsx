'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface OrderDetails {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
}

export default function OrderFailedPage() {
  const { orderId } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user || !orderId) return

      try {
        const token = await user.getIdToken()
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const orderData = await response.json()
          setOrder(orderData)
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [user, orderId])

  const handleRetryPayment = async () => {
    if (!user || !orderId) return

    setRetrying(true)
    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/tokenizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: orderId
        })
      })

      if (response.ok) {
        const { token: snapToken } = await response.json()
        
        if (typeof window !== 'undefined' && (window as any).snap) {
          (window as any).snap.pay(snapToken, {
            onSuccess: function(result: any) {
              window.location.href = `/order/success/${orderId}`
            },
            onPending: function(result: any) {
              window.location.href = `/order/pending/${orderId}`
            },
            onError: function(result: any) {
              setRetrying(false)
            },
            onClose: function() {
              setRetrying(false)
            }
          })
        }
      }
    } catch (error) {
      console.error('Error retrying payment:', error)
      setRetrying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Failed Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600">Unfortunately, your payment could not be processed.</p>
        </div>

        {/* Order Info */}
        {order && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold">
                  Rp {order.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Possible Reasons */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Possible Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Insufficient funds in your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Card details entered incorrectly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Payment method not supported</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Network connection issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Transaction declined by bank</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* What to do next */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What You Can Do</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-medium text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium">Try a different payment method</p>
                  <p className="text-gray-600 text-sm">Use a different card or payment option</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-medium text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium">Check your payment details</p>
                  <p className="text-gray-600 text-sm">Ensure card number, expiry date, and CVV are correct</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-medium text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium">Contact your bank</p>
                  <p className="text-gray-600 text-sm">Your bank may have blocked the transaction</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleRetryPayment}
            disabled={retrying || !order}
            className="flex-1"
          >
            {retrying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Payment
              </>
            )}
          </Button>
          <Link href="/cart" className="flex-1">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>

        {/* Help Section */}
        <Card className="mt-6">
          <CardContent className="text-center py-6">
            <p className="text-gray-600 mb-2">Still having trouble?</p>
            <p className="text-sm text-gray-500">
              Contact our support team at{' '}
              <a href="mailto:support@thrifthaven.com" className="text-blue-600 hover:underline">
                support@thrifthaven.com
              </a>
              {' '}or call us at{' '}
              <a href="tel:+6281234567890" className="text-blue-600 hover:underline">
                +62 812-3456-7890
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
