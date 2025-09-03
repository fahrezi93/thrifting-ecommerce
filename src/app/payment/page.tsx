'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  CheckCircle,
  Clock,
  ArrowLeft
} from 'lucide-react'
import Image from 'next/image'

interface PaymentMethod {
  id: string
  name: string
  type: 'ewallet' | 'bank' | 'retail'
  icon: string
  description: string
  fee: number
  processingTime: string
}


const paymentMethods: PaymentMethod[] = [
  {
    id: 'qris',
    name: 'QRIS',
    type: 'ewallet',
    icon: '/payment-icons/qris.png',
    description: 'Scan QR code dengan aplikasi e-money dan bank',
    fee: 0,
    processingTime: 'Instan'
  },
  {
    id: 'ovo',
    name: 'OVO',
    type: 'ewallet',
    icon: '/payment-icons/ovo.png',
    description: 'Bayar dengan saldo OVO atau OVO PayLater',
    fee: 0,
    processingTime: 'Instan'
  },
  {
    id: 'dana',
    name: 'DANA',
    type: 'ewallet',
    icon: '/payment-icons/dana.png',
    description: 'Bayar dengan saldo DANA',
    fee: 0,
    processingTime: 'Instan'
  },
  {
    id: 'linkaja',
    name: 'LinkAja',
    type: 'ewallet',
    icon: '/payment-icons/linkaja.png',
    description: 'Bayar dengan saldo LinkAja',
    fee: 0,
    processingTime: 'Instan'
  },
  {
    id: 'gopay',
    name: 'GoPay',
    type: 'ewallet',
    icon: '/payment-icons/gopay.png',
    description: 'Bayar dengan saldo GoPay',
    fee: 0,
    processingTime: 'Instan'
  },
  {
    id: 'bca',
    name: 'BCA Virtual Account',
    type: 'bank',
    icon: '/payment-icons/bca.png',
    description: 'Transfer ke Virtual Account BCA',
    fee: 4000,
    processingTime: '1-10 menit'
  },
  {
    id: 'bni',
    name: 'BNI Virtual Account',
    type: 'bank',
    icon: '/payment-icons/bni.png',
    description: 'Transfer ke Virtual Account BNI',
    fee: 4000,
    processingTime: '1-10 menit'
  },
  {
    id: 'bri',
    name: 'BRI Virtual Account',
    type: 'bank',
    icon: '/payment-icons/bri.png',
    description: 'Transfer ke Virtual Account BRI',
    fee: 4000,
    processingTime: '1-10 menit'
  },
  {
    id: 'mandiri',
    name: 'Mandiri Virtual Account',
    type: 'bank',
    icon: '/payment-icons/mandiri.png',
    description: 'Transfer ke Virtual Account Mandiri',
    fee: 4000,
    processingTime: '1-10 menit'
  },
  {
    id: 'alfamart',
    name: 'Alfamart',
    type: 'retail',
    icon: '/payment-icons/alfamart.png',
    description: 'Bayar di kasir Alfamart terdekat',
    fee: 2500,
    processingTime: '1-24 jam'
  },
  {
    id: 'indomaret',
    name: 'Indomaret',
    type: 'retail',
    icon: '/payment-icons/indomaret.png',
    description: 'Bayar di kasir Indomaret terdekat',
    fee: 2500,
    processingTime: '1-24 jam'
  }
]

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [orderSummary, setOrderSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const token = searchParams.get('token')
  const amount = searchParams.get('amount')

  useEffect(() => {
    if (!token || !amount) {
      router.push('/checkout')
      return
    }
    setLoading(false)
  }, [token, amount, router])


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'ewallet':
        return <Smartphone className="w-5 h-5" />
      case 'bank':
        return <Building2 className="w-5 h-5" />
      case 'retail':
        return <CreditCard className="w-5 h-5" />
      default:
        return <Wallet className="w-5 h-5" />
    }
  }

  const handlePayment = async () => {
    if (!selectedMethod || !token) return

    setProcessing(true)
    try {
      // Load Midtrans Snap
      const script = document.createElement('script')
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-dummy-key-for-dev')
      document.head.appendChild(script)

      script.onload = () => {
        // @ts-ignore
        window.snap.pay(token, {
          onSuccess: (result: any) => {
            router.push(`/dashboard/orders?success=true`)
          },
          onPending: (result: any) => {
            router.push(`/dashboard/orders?pending=true`)
          },
          onError: (result: any) => {
            console.error('Payment failed:', result)
            setProcessing(false)
          },
          onClose: () => {
            console.log('Payment popup closed')
            setProcessing(false)
          }
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading payment information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!token || !amount) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Invalid Payment Session</h3>
            <p className="text-muted-foreground mb-4">
              Payment session not found. Please start from checkout.
            </p>
            <Button onClick={() => router.push('/checkout')}>
              Back to Checkout
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod)
  const baseAmount = amount ? parseInt(amount) : 0
  const finalTotal = baseAmount + (selectedPaymentMethod?.fee || 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Pilih Metode Pembayaran</h1>
          <p className="text-muted-foreground">
            Total: {amount ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(parseInt(amount)) : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          {/* E-Wallet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                E-Wallet
              </CardTitle>
              <CardDescription>
                Pembayaran instan dengan dompet digital
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentMethods.filter(m => m.type === 'ewallet').map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMethod === method.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs font-medium">{method.name}</span>
                      </div>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">Gratis</p>
                      <p className="text-xs text-muted-foreground">{method.processingTime}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Bank Transfer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Transfer Bank
              </CardTitle>
              <CardDescription>
                Transfer ke Virtual Account bank
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentMethods.filter(m => m.type === 'bank').map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMethod === method.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs font-medium">{method.name.split(' ')[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatPrice(method.fee)}</p>
                      <p className="text-xs text-muted-foreground">{method.processingTime}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Retail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Retail Store
              </CardTitle>
              <CardDescription>
                Bayar di toko retail terdekat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentMethods.filter(m => m.type === 'retail').map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMethod === method.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs font-medium">{method.name}</span>
                      </div>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatPrice(method.fee)}</p>
                      <p className="text-xs text-muted-foreground">{method.processingTime}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pricing */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Pesanan</span>
                  <span>{formatPrice(baseAmount)}</span>
                </div>
                {selectedPaymentMethod && selectedPaymentMethod.fee > 0 && (
                  <div className="flex justify-between">
                    <span>Biaya Admin</span>
                    <span>{formatPrice(selectedPaymentMethod.fee)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>

              {/* Payment Button */}
              <Button 
                className="w-full" 
                size="lg"
                disabled={!selectedMethod || processing}
                onClick={handlePayment}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Bayar Sekarang
                  </>
                )}
              </Button>

              {selectedMethod && (
                <div className="text-xs text-muted-foreground text-center">
                  Dengan melanjutkan, Anda menyetujui syarat dan ketentuan pembayaran
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
