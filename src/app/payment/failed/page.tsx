'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react'

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
      'timeout': 'Waktu pembayaran habis',
      'insufficient_funds': 'Saldo tidak mencukupi',
      'invalid_payment': 'Pembayaran tidak valid',
      'cancelled': 'Pembayaran dibatalkan',
      'network_error': 'Gangguan jaringan',
      'bank_error': 'Gangguan sistem bank'
    }
    return reasons[reason] || 'Pembayaran gagal diproses'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Failed Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-red-600 mb-2">Pembayaran Gagal</h1>
        <p className="text-muted-foreground">
          {getFailureReason(reason)}
        </p>
      </div>

      {/* Error Details */}
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            Detail Kesalahan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-red-800">
            <p><strong>Alasan:</strong> {getFailureReason(reason)}</p>
            {orderId && <p><strong>Order ID:</strong> {orderId}</p>}
            <p><strong>Waktu:</strong> {new Date().toLocaleString('id-ID')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Solutions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Solusi yang Dapat Dicoba</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Periksa Saldo atau Limit</p>
                <p className="text-sm text-muted-foreground">Pastikan saldo e-wallet atau limit kartu kredit mencukupi</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Coba Metode Pembayaran Lain</p>
                <p className="text-sm text-muted-foreground">Gunakan metode pembayaran alternatif yang tersedia</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">Periksa Koneksi Internet</p>
                <p className="text-sm text-muted-foreground">Pastikan koneksi internet stabil dan coba lagi</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                4
              </div>
              <div>
                <p className="font-medium">Hubungi Bank/Provider</p>
                <p className="text-sm text-muted-foreground">Jika masalah berlanjut, hubungi penyedia layanan pembayaran</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Button 
          onClick={handleRetryPayment}
          className="w-full"
          disabled={!orderId}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Coba Lagi
        </Button>
        <Button 
          variant="outline"
          onClick={() => router.push('/dashboard/orders')}
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Pesanan
        </Button>
      </div>

      {/* Contact Support */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="text-center text-sm text-orange-800">
            <p className="font-medium mb-2">Masih mengalami masalah?</p>
            <p className="mb-2">Tim customer service kami siap membantu Anda 24/7</p>
            <div className="space-y-1">
              <p><strong>WhatsApp:</strong> +62 812-3456-7890</p>
              <p><strong>Email:</strong> support@thrifthaven.com</p>
              <p><strong>Live Chat:</strong> Tersedia di website</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
