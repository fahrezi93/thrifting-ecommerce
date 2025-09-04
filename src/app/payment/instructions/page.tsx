'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Copy, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  QrCode,
  Building2,
  CreditCard,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PaymentInstruction {
  orderId: string
  orderNumber: string
  paymentMethod: string
  amount: number
  virtualAccount?: string
  qrCode?: string
  paymentCode?: string
  instructions: string[]
  expiresAt: string
}

export default function PaymentInstructionsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [instruction, setInstruction] = useState<PaymentInstruction | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState('')
  const [checkingStatus, setCheckingStatus] = useState(false)

  const orderId = searchParams.get('orderId')
  const method = searchParams.get('method')

  useEffect(() => {
    if (orderId && method) {
      fetchPaymentInstructions()
      // Start periodic status checking
      const statusInterval = setInterval(checkPaymentStatus, 30000) // Check every 30 seconds
      return () => clearInterval(statusInterval)
    } else {
      setLoading(false)
    }
  }, [orderId, method])

  useEffect(() => {
    if (instruction?.expiresAt) {
      const timer = setInterval(() => {
        const now = new Date().getTime()
        const expiry = new Date(instruction.expiresAt).getTime()
        const difference = expiry - now

        if (difference > 0) {
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((difference % (1000 * 60)) / 1000)
          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
        } else {
          setTimeLeft('Expired')
          clearInterval(timer)
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [instruction])

  const fetchPaymentInstructions = async () => {
    try {
      if (!user || !user.getIdToken) return
      
      const token = await user.getIdToken()
      const response = await fetch(`/api/payment/instructions?orderId=${orderId}&method=${method}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setInstruction(data)
      }
    } catch (error) {
      console.error('Error fetching payment instructions:', error)
    } finally {
      setLoading(false)
    }
  }

  const { addToast } = useToast()

  const checkPaymentStatus = async () => {
    if (!orderId || checkingStatus) return
    
    setCheckingStatus(true)
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
          router.push(`/payment/success?orderId=${orderId}`)
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    addToast({
      title: "Copied!",
      description: "Text copied to clipboard",
      variant: "success"
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  const getMethodInfo = (method: string) => {
    const methods: Record<string, { name: string; icon: any; color: string }> = {
      qris: { name: 'QRIS', icon: QrCode, color: 'bg-blue-100 text-blue-800' },
      ovo: { name: 'OVO', icon: QrCode, color: 'bg-purple-100 text-purple-800' },
      dana: { name: 'DANA', icon: QrCode, color: 'bg-blue-100 text-blue-800' },
      linkaja: { name: 'LinkAja', icon: QrCode, color: 'bg-red-100 text-red-800' },
      gopay: { name: 'GoPay', icon: QrCode, color: 'bg-green-100 text-green-800' },
      bca: { name: 'BCA Virtual Account', icon: Building2, color: 'bg-blue-100 text-blue-800' },
      bni: { name: 'BNI Virtual Account', icon: Building2, color: 'bg-orange-100 text-orange-800' },
      bri: { name: 'BRI Virtual Account', icon: Building2, color: 'bg-blue-100 text-blue-800' },
      mandiri: { name: 'Mandiri Virtual Account', icon: Building2, color: 'bg-yellow-100 text-yellow-800' },
      alfamart: { name: 'Alfamart', icon: CreditCard, color: 'bg-red-100 text-red-800' },
      indomaret: { name: 'Indomaret', icon: CreditCard, color: 'bg-yellow-100 text-yellow-800' }
    }
    return methods[method] || { name: method, icon: CreditCard, color: 'bg-gray-100 text-gray-800' }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading payment instructions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!instruction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Payment instructions not found</h3>
            <p className="text-muted-foreground mb-4">
              Unable to load payment instructions for this order.
            </p>
            <Button onClick={() => router.push('/dashboard/orders')}>
              View Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const methodInfo = getMethodInfo(instruction.paymentMethod)
  const MethodIcon = methodInfo.icon

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/dashboard/orders')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Pesanan
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Instruksi Pembayaran</h1>
          <p className="text-muted-foreground">
            Order #{instruction.orderNumber}
          </p>
        </div>
      </div>

      {/* Payment Method & Timer */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MethodIcon className="w-6 h-6" />
              <div>
                <CardTitle>{methodInfo.name}</CardTitle>
                <CardDescription>Total: {formatPrice(instruction.amount)}</CardDescription>
              </div>
            </div>
            <Badge className={methodInfo.color}>
              <Clock className="w-3 h-3 mr-1" />
              {timeLeft}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Payment Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Detail Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Virtual Account Number */}
          {instruction.virtualAccount && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nomor Virtual Account</p>
                  <p className="text-lg font-mono font-bold">{instruction.virtualAccount}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(instruction.virtualAccount!)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Payment Code */}
          {instruction.paymentCode && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kode Pembayaran</p>
                  <p className="text-lg font-mono font-bold">{instruction.paymentCode}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(instruction.paymentCode!)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* QR Code */}
          {instruction.qrCode && (
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">Scan QR Code</p>
              <div className="w-48 h-48 bg-white mx-auto rounded-lg flex items-center justify-center">
                <QrCode className="w-32 h-32 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Gunakan aplikasi e-wallet untuk scan QR code
              </p>
            </div>
          )}

          {/* Amount */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jumlah yang harus dibayar</p>
                <p className="text-2xl font-bold text-primary">{formatPrice(instruction.amount)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(instruction.amount.toString())}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cara Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {instruction.instructions.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <p className="text-sm">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">Penting!</p>
              <ul className="space-y-1 text-xs">
                <li>• Pastikan nominal yang dibayar sesuai dengan jumlah yang tertera</li>
                <li>• Pembayaran akan otomatis dikonfirmasi setelah berhasil</li>
                <li>• Jika pembayaran tidak berhasil dalam batas waktu, pesanan akan dibatalkan</li>
                <li>• Hubungi customer service jika mengalami kendala</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => router.push('/dashboard/orders')}
        >
          Lihat Status Pesanan
        </Button>
        <Button 
          className="flex-1"
          onClick={checkPaymentStatus}
          disabled={checkingStatus}
        >
          {checkingStatus ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Mengecek...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Cek Status Pembayaran
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
