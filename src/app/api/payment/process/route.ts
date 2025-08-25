import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  createQRISPayment, 
  createVAPayment, 
  createEWalletPayment,
  createSnapToken,
  MidtransPaymentRequest 
} from '@/lib/midtrans'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { orderId, paymentMethod } = await request.json()

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

    // Generate payment instruction based on method
    const paymentInstruction = await generatePaymentInstructions(paymentMethod, order, user)

    // Update order with payment method
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod: paymentMethod,
        status: 'PENDING'
      }
    })

    return NextResponse.json(paymentInstruction)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error processing payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const generatePaymentInstructions = async (paymentMethod: string, order: any, user: any) => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

  // Prepare Midtrans request
  const midtransRequest: MidtransPaymentRequest = {
    orderId: order.orderNumber,
    amount: order.totalAmount,
    customerDetails: {
      first_name: user.name || 'Customer',
      email: user.email,
      phone: '081234567890' // You might want to get this from user profile
    },
    paymentMethod
  }

  switch (paymentMethod) {
    case 'qris':
      try {
        const qrisResponse = await createQRISPayment(midtransRequest)

        // Store payment transaction in database (commented out until Prisma generates)
        // await prisma.payment.create({
        //   data: {
        //     orderId: order.id,
        //     transactionId: qrisResponse.transaction_id,
        //     paymentMethod: 'qris',
        //     amount: order.totalAmount,
        //     status: 'PENDING',
        //     midtransResponse: JSON.stringify(qrisResponse),
        //     expiresAt
        //   }
        // })

        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          paymentMethod,
          amount: order.totalAmount,
          qrCode: qrisResponse.qr_string || 'qr_code_data_here',
          transactionId: qrisResponse.transaction_id,
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
      } catch (error) {
        console.error('QRIS Payment Error:', error)
        // Fallback to mock data if Midtrans fails
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
      }

    case 'ovo':
    case 'dana':
    case 'linkaja':
    case 'gopay':
      try {
        const ewalletResponse = await createEWalletPayment(midtransRequest, paymentMethod === 'gopay' ? 'gopay' : 'shopeepay')
        
        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          paymentMethod,
          amount: order.totalAmount,
          redirectUrl: ewalletResponse.actions?.[0]?.url || `https://payment-gateway.example.com/${paymentMethod}?amount=${order.totalAmount}&order=${order.orderNumber}`,
          transactionId: ewalletResponse.transaction_id,
          expiresAt,
          instructions: [
            `Anda akan diarahkan ke aplikasi ${paymentMethod.toUpperCase()}`,
            'Login ke akun Anda jika diminta',
            'Periksa detail pembayaran',
            'Konfirmasi pembayaran dengan PIN atau biometrik',
            'Tunggu notifikasi pembayaran berhasil'
          ]
        }
      } catch (error) {
        console.error(`${paymentMethod} Payment Error:`, error)
        // Fallback to mock data
        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          paymentMethod,
          amount: order.totalAmount,
          redirectUrl: `https://payment-gateway.example.com/${paymentMethod}?amount=${order.totalAmount}&order=${order.orderNumber}`,
          expiresAt,
          instructions: [
            `Anda akan diarahkan ke aplikasi ${paymentMethod.toUpperCase()}`,
            'Login ke akun Anda jika diminta',
            'Periksa detail pembayaran',
            'Konfirmasi pembayaran dengan PIN atau biometrik',
            'Tunggu notifikasi pembayaran berhasil'
          ]
        }
      }

    case 'bca':
    case 'bni':
    case 'bri':
    case 'mandiri':
      try {
        const vaResponse = await createVAPayment(midtransRequest, paymentMethod as 'bca' | 'bni' | 'bri' | 'mandiri')
        
        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          paymentMethod,
          amount: order.totalAmount,
          virtualAccount: vaResponse.va_numbers?.[0]?.va_number || `${paymentMethod.toUpperCase()}${Date.now().toString().slice(-10)}`,
          bankCode: paymentMethod.toUpperCase(),
          transactionId: vaResponse.transaction_id,
          expiresAt,
          instructions: [
            `Buka aplikasi mobile banking atau ATM ${paymentMethod.toUpperCase()}`,
            'Pilih menu "Transfer" atau "Bayar"',
            'Pilih "Virtual Account" atau "Rekening Virtual"',
            `Masukkan nomor Virtual Account: ${vaResponse.va_numbers?.[0]?.va_number || 'VA_NUMBER'}`,
            `Masukkan nominal: Rp ${order.totalAmount.toLocaleString('id-ID')}`,
            'Konfirmasi pembayaran dengan PIN',
            'Simpan bukti transfer untuk referensi'
          ]
        }
      } catch (error) {
        console.error(`${paymentMethod.toUpperCase()} VA Error:`, error)
        // Fallback to mock data
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
          amount: order.totalAmount + 4000, // Admin fee
          virtualAccount,
          expiresAt,
          instructions: [
            `Login ke mobile banking atau internet banking ${paymentMethod.toUpperCase()}`,
            'Pilih menu "Transfer" atau "Bayar"',
            'Pilih "Virtual Account" atau "VA"',
            `Masukkan nomor Virtual Account: ${virtualAccount}`,
            `Masukkan nominal: ${(order.totalAmount + 4000).toLocaleString('id-ID')}`,
            'Periksa detail pembayaran dan konfirmasi',
            'Simpan bukti transfer sebagai referensi'
          ]
        }
      }

    case 'alfamart':
    case 'indomaret':
      const paymentCode = `PAY${order.orderNumber.slice(-8)}`
      
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod,
        amount: order.totalAmount + 2500, // Admin fee
        paymentCode,
        expiresAt,
        instructions: [
          `Kunjungi toko ${paymentMethod === 'alfamart' ? 'Alfamart' : 'Indomaret'} terdekat`,
          'Datang ke kasir dan sampaikan ingin bayar tagihan',
          `Berikan kode pembayaran: ${paymentCode}`,
          `Bayar sejumlah: ${(order.totalAmount + 2500).toLocaleString('id-ID')}`,
          'Terima dan simpan struk pembayaran',
          'Pembayaran akan dikonfirmasi otomatis dalam 1-24 jam'
        ]
      }

    default:
      throw new Error('Invalid payment method')
  }
}
