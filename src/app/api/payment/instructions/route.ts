import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const method = searchParams.get('method')

    if (!orderId || !method) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Generate payment instruction
    const instruction = generatePaymentInstruction(order, method)

    return NextResponse.json(instruction)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching payment instructions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generatePaymentInstruction(order: any, paymentMethod: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

  switch (paymentMethod) {
    case 'qris':
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod,
        amount: order.totalAmount,
        qrCode: 'qr_code_data_here',
        expiresAt,
        instructions: [
          'Buka aplikasi e-wallet atau mobile banking Anda',
          'Pilih menu "Scan QR" atau "QRIS"',
          'Arahkan kamera ke QR code di atas',
          'Pastikan nominal sesuai dengan yang tertera',
          'Masukkan PIN untuk konfirmasi pembayaran',
          'Simpan bukti pembayaran untuk referensi'
        ]
      }

    case 'ovo':
    case 'dana':
    case 'linkaja':
    case 'gopay':
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod,
        amount: order.totalAmount,
        expiresAt,
        instructions: [
          `Buka aplikasi ${paymentMethod.toUpperCase()}`,
          'Login ke akun Anda jika diminta',
          'Periksa detail pembayaran',
          'Konfirmasi pembayaran dengan PIN atau biometrik',
          'Tunggu notifikasi pembayaran berhasil'
        ]
      }

    case 'bca':
    case 'bni':
    case 'bri':
    case 'mandiri':
      const bankCode = {
        bca: '014',
        bni: '009',
        bri: '002',
        mandiri: '008'
      }[paymentMethod] || '000'
      
      const virtualAccount = `${bankCode}${order.orderNumber.slice(-10)}`
      
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod,
        amount: order.totalAmount + 4000,
        virtualAccount,
        expiresAt,
        instructions: [
          `Login ke mobile banking atau internet banking ${paymentMethod.toUpperCase()}`,
          'Pilih menu "Transfer" atau "Bayar"',
          'Pilih "Virtual Account" atau "VA"',
          `Masukkan nomor Virtual Account: ${virtualAccount}`,
          `Masukkan nominal: Rp ${(order.totalAmount + 4000).toLocaleString('id-ID')}`,
          'Periksa detail pembayaran dan konfirmasi',
          'Simpan bukti transfer sebagai referensi'
        ]
      }

    case 'alfamart':
    case 'indomaret':
      const paymentCode = `PAY${order.orderNumber.slice(-8)}`
      
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod,
        amount: order.totalAmount + 2500,
        paymentCode,
        expiresAt,
        instructions: [
          `Kunjungi toko ${paymentMethod === 'alfamart' ? 'Alfamart' : 'Indomaret'} terdekat`,
          'Datang ke kasir dan sampaikan ingin bayar tagihan',
          `Berikan kode pembayaran: ${paymentCode}`,
          `Bayar sejumlah: Rp ${(order.totalAmount + 2500).toLocaleString('id-ID')}`,
          'Terima dan simpan struk pembayaran',
          'Pembayaran akan dikonfirmasi otomatis dalam 1-24 jam'
        ]
      }

    default:
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod,
        amount: order.totalAmount,
        expiresAt,
        instructions: ['Invalid payment method']
      }
  }
}
