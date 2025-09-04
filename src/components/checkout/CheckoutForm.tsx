'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CreditCard, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/store/cart'
import { toast } from 'sonner'

interface CheckoutFormProps {
  shippingAddress: any
  shippingCost: number
  totalAmount: number
}

export default function CheckoutForm({ shippingAddress, shippingCost, totalAmount }: CheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { user } = useAuth()
  const { items, clearCart } = useCart()

  const handlePayment = async () => {
    if (!user || !shippingAddress) {
      toast.error('Missing required information')
      return
    }

    setIsProcessing(true)

    try {
      // Step 1: Create order first
      if (!user || !user.getIdToken) return
      const token = await user.getIdToken()
      
      const orderItems = items.map((item: any) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }))

      const createOrderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          shippingAddressId: shippingAddress.id,
          shippingCost,
          notes: ''
        })
      })

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const { order } = await createOrderResponse.json()
      
      // Step 2: Get payment token using orderId
      const tokenizerResponse = await fetch('/api/tokenizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order.id
        })
      })

      if (!tokenizerResponse.ok) {
        const errorData = await tokenizerResponse.json()
        throw new Error(errorData.error || 'Failed to create payment token')
      }

      const { token: snapToken, orderId } = await tokenizerResponse.json()

      // Step 3: Open Midtrans Snap
      if (typeof window !== 'undefined' && (window as any).snap) {
        (window as any).snap.pay(snapToken, {
          onSuccess: function(result: any) {
            console.log('Payment success:', result)
            toast.success('Payment successful!')
            
            // Clear cart after successful payment
            clearCart()
            
            // Redirect to success page
            window.location.href = `/order/success/${orderId}`
          },
          onPending: function(result: any) {
            console.log('Payment pending:', result)
            toast.info('Payment is being processed...')
            window.location.href = `/order/pending/${orderId}`
          },
          onError: function(result: any) {
            console.error('Payment error:', result)
            toast.error('Payment failed. Please try again.')
            window.location.href = `/order/failed/${orderId}`
          },
          onClose: function() {
            console.log('Payment popup closed')
            toast.info('Payment cancelled')
            setIsProcessing(false)
          }
        })
      } else {
        throw new Error('Midtrans Snap not loaded')
      }

    } catch (error) {
      console.error('Payment process error:', error)
      toast.error(error instanceof Error ? error.message : 'Payment failed')
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Summary */}
        <div className="space-y-2">
          <h3 className="font-medium">Order Summary</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal ({items.length} items)</span>
              <span>Rp {(totalAmount - shippingCost).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Rp {shippingCost.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Total</span>
              <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Info */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Secure Payment</p>
              <p>You will be redirected to Midtrans secure payment page. Multiple payment methods available including credit cards, bank transfers, and e-wallets.</p>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={handlePayment}
          disabled={isProcessing || !user || !shippingAddress}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay Now - Rp {totalAmount.toLocaleString('id-ID')}
            </>
          )}
        </Button>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          By clicking "Pay Now", you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardContent>
    </Card>
  )
}
