'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Package, ArrowRight, Download } from 'lucide-react'

interface PaymentSuccess {
  orderId: string
  orderNumber: string
  amount: number
  paidAt: string
  paymentMethod: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [paymentData, setPaymentData] = useState<PaymentSuccess | null>(null)
  const [loading, setLoading] = useState(true)

  const orderId = searchParams.get('orderId')

  useEffect(() => {
    if (orderId) {
      fetchPaymentData()
    } else {
      setLoading(false)
    }
  }, [orderId])

  const fetchPaymentData = async () => {
    try {
      if (!user || !user.getIdToken) return
      
      const token = await user.getIdToken()
      const response = await fetch(`/api/payment/status?orderId=${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'PAID') {
          setPaymentData({
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            amount: data.amount,
            paidAt: data.paidAt,
            paymentMethod: 'Payment Gateway'
          })
        }
      }
    } catch (error) {
      console.error('Error fetching payment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Verifying payment...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Payment not found</h3>
            <p className="text-muted-foreground mb-4">
              Unable to verify payment for this order.
            </p>
            <Button onClick={() => router.push('/dashboard/orders')}>
              View Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">Pembayaran Berhasil!</h1>
        <p className="text-muted-foreground">
          Terima kasih atas pembayaran Anda. Pesanan sedang diproses.
        </p>
      </div>

      {/* Payment Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Detail Pembayaran</span>
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Lunas
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Nomor Pesanan</p>
              <p className="font-semibold">{paymentData.orderNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tanggal Pembayaran</p>
              <p className="font-semibold">{formatDate(paymentData.paidAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Metode Pembayaran</p>
              <p className="font-semibold">{paymentData.paymentMethod}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Dibayar</p>
              <p className="font-semibold text-lg text-green-600">{formatPrice(paymentData.amount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Langkah Selanjutnya
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Pesanan Dikonfirmasi</p>
                <p className="text-sm text-muted-foreground">Kami akan memproses pesanan Anda dalam 1-2 hari kerja</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Pesanan Dikirim</p>
                <p className="text-sm text-muted-foreground">Anda akan menerima nomor resi untuk tracking pengiriman</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">Pesanan Diterima</p>
                <p className="text-sm text-muted-foreground">Nikmati produk thrift berkualitas Anda!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/orders')}
          className="w-full"
        >
          <Package className="w-4 h-4 mr-2" />
          Lihat Pesanan
        </Button>
        <Button 
          onClick={() => router.push('/products')}
          className="w-full"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Belanja Lagi
        </Button>
      </div>

      {/* Contact Info */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="text-center text-sm text-blue-800">
            <p className="font-medium mb-1">Butuh bantuan?</p>
            <p>Hubungi customer service kami di WhatsApp: <span className="font-semibold">+62 812-3456-7890</span></p>
            <p>atau email: <span className="font-semibold">support@thrifthaven.com</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
