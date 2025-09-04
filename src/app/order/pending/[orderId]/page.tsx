'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, RefreshCw, Home, Package } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface OrderDetails {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
}

export default function OrderPendingPage() {
  const { orderId } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user || !orderId) return

      try {
        if (!user || !user.getIdToken) return
        const token = await user.getIdToken()
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const orderData = await response.json()
          setOrder(orderData)
          
          // If order is already paid, redirect to success
          if (orderData.status === 'PAID') {
            window.location.href = `/order/success/${orderId}`
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()

    // Check payment status every 5 seconds
    const interval = setInterval(fetchOrderDetails, 5000)
    return () => clearInterval(interval)
  }, [user, orderId])

  const handleCheckStatus = async () => {
    if (!user || !orderId) return

    setChecking(true)
    try {
      if (!user || !user.getIdToken) return
      const token = await user.getIdToken()
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const orderData = await response.json()
        setOrder(orderData)
        
        if (orderData.status === 'PAID') {
          window.location.href = `/order/success/${orderId}`
        }
      }
    } catch (error) {
      console.error('Error checking status:', error)
    } finally {
      setChecking(false)
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
        {/* Pending Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Pending</h1>
          <p className="text-gray-600">Your payment is being processed. Please wait for confirmation.</p>
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
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
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

        {/* Status Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Happening?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-medium text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium">Payment submitted</p>
                  <p className="text-gray-600 text-sm">Your payment has been sent for processing</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">Waiting for confirmation</p>
                  <p className="text-gray-600 text-sm">This usually takes a few minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-400 font-medium text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-400">Order confirmed</p>
                  <p className="text-gray-400 text-sm">You'll be redirected automatically</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto-refresh notice */}
        <Card className="mb-8">
          <CardContent className="text-center py-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-sm font-medium">Auto-checking status...</span>
            </div>
            <p className="text-xs text-gray-500">
              This page will automatically update when your payment is confirmed
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleCheckStatus}
            disabled={checking}
            variant="outline"
            className="flex-1"
          >
            {checking ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Status
              </>
            )}
          </Button>
          <Link href="/dashboard/orders" className="flex-1">
            <Button variant="outline" className="w-full">
              <Package className="w-4 h-4 mr-2" />
              View Orders
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
            <p className="text-gray-600 mb-2">Taking longer than expected?</p>
            <p className="text-sm text-gray-500">
              Some payment methods may take up to 24 hours to process. If you need help, contact us at{' '}
              <a href="mailto:support@thrifthaven.com" className="text-blue-600 hover:underline">
                support@thrifthaven.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
