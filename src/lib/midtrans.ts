import { CoreApi, Snap } from 'midtrans-client'

// Initialize Midtrans Core API
const coreApi = new CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!
})

// Initialize Midtrans Snap
const snap = new Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!
})

export interface MidtransPaymentRequest {
  orderId: string
  amount: number
  customerDetails: {
    first_name: string
    email: string
    phone: string
  }
  paymentMethod: string
}

export interface MidtransQRISResponse {
  status_code: string
  status_message: string
  transaction_id: string
  order_id: string
  merchant_id: string
  gross_amount: string
  currency: string
  payment_type: string
  transaction_time: string
  transaction_status: string
  fraud_status: string
  actions: Array<{
    name: string
    method: string
    url: string
  }>
  qr_string?: string
}

export interface MidtransVAResponse {
  status_code: string
  status_message: string
  transaction_id: string
  order_id: string
  gross_amount: string
  payment_type: string
  transaction_time: string
  transaction_status: string
  va_numbers: Array<{
    bank: string
    va_number: string
  }>
}

// Create QRIS payment
export async function createQRISPayment(request: MidtransPaymentRequest): Promise<MidtransQRISResponse> {
  const parameter = {
    payment_type: 'qris',
    transaction_details: {
      order_id: request.orderId,
      gross_amount: request.amount
    },
    customer_details: request.customerDetails,
    qris: {
      acquirer: 'gopay'
    }
  }

  try {
    const response = await coreApi.charge(parameter)
    return response as MidtransQRISResponse
  } catch (error) {
    console.error('Midtrans QRIS Error:', error)
    throw error
  }
}

// Create Virtual Account payment
export async function createVAPayment(
  request: MidtransPaymentRequest, 
  bank: 'bca' | 'bni' | 'bri' | 'mandiri'
): Promise<MidtransVAResponse> {
  const parameter = {
    payment_type: 'bank_transfer',
    transaction_details: {
      order_id: request.orderId,
      gross_amount: request.amount
    },
    customer_details: request.customerDetails,
    bank_transfer: {
      bank: bank
    }
  }

  try {
    const response = await coreApi.charge(parameter)
    return response as MidtransVAResponse
  } catch (error) {
    console.error(`Midtrans ${bank.toUpperCase()} VA Error:`, error)
    throw error
  }
}

// Create E-Wallet payment (OVO, DANA, LinkAja, GoPay)
export async function createEWalletPayment(
  request: MidtransPaymentRequest,
  wallet: 'gopay' | 'shopeepay'
): Promise<any> {
  const parameter = {
    payment_type: wallet,
    transaction_details: {
      order_id: request.orderId,
      gross_amount: request.amount
    },
    customer_details: request.customerDetails,
    [wallet]: {
      enable_callback: true,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`
    }
  }

  try {
    const response = await coreApi.charge(parameter)
    return response
  } catch (error) {
    console.error(`Midtrans ${wallet} Error:`, error)
    throw error
  }
}

// Check payment status
export async function checkPaymentStatus(orderId: string): Promise<any> {
  try {
    const response = await coreApi.transaction.status(orderId)
    return response
  } catch (error) {
    console.error('Midtrans Status Check Error:', error)
    throw error
  }
}

// Create Snap token for redirect payments
export async function createSnapToken(request: MidtransPaymentRequest): Promise<string> {
  const parameter = {
    transaction_details: {
      order_id: request.orderId,
      gross_amount: request.amount
    },
    customer_details: request.customerDetails,
    credit_card: {
      secure: true
    }
  }

  try {
    const response = await snap.createTransaction(parameter)
    return response.token
  } catch (error) {
    console.error('Midtrans Snap Token Error:', error)
    throw error
  }
}

export { coreApi, snap }
