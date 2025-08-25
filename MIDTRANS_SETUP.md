# Midtrans Payment Gateway Integration

## Setup Instructions

### 1. Get Midtrans Account
1. Register at https://midtrans.com/
2. Complete merchant verification
3. Get your API keys from dashboard

### 2. Environment Variables
Add these to your `.env` file:

```env
# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY=your_server_key_here
MIDTRANS_CLIENT_KEY=your_client_key_here
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_MERCHANT_ID=your_merchant_id_here
```

### 3. Install Dependencies
```bash
npm install midtrans-client
```

### 4. Database Migration
Run the migration to add Payment model:
```bash
npx prisma migrate dev --name add-payment-model
npx prisma generate
```

## Payment Methods Supported

### Real Integration (with Midtrans API):
- ✅ **QRIS** - Real QR code generation
- ✅ **Virtual Account** - BCA, BNI, BRI, Mandiri
- ✅ **E-Wallet** - GoPay, ShopeePay (via Midtrans)

### Mock Integration (fallback):
- 🔄 **OVO, DANA, LinkAja** - Redirect URLs
- 🔄 **Alfamart, Indomaret** - Payment codes

## API Endpoints

### Payment Processing
- `POST /api/payment/process` - Create payment instruction
- `GET /api/payment/status` - Check payment status
- `POST /api/payment/webhook` - Handle Midtrans webhook

### Webhook Configuration
Set webhook URL in Midtrans dashboard:
```
https://yourdomain.com/api/payment/webhook
```

## Testing

### Sandbox Mode
- Use `MIDTRANS_IS_PRODUCTION=false`
- Test cards and accounts available in Midtrans docs

### Production Mode
- Set `MIDTRANS_IS_PRODUCTION=true`
- Use real API keys
- Configure real webhook URL

## Security Features

- ✅ Signature verification for webhooks
- ✅ JWT token authentication
- ✅ Order ownership validation
- ✅ Automatic stock reduction on payment success
- ✅ Payment expiry handling (24 hours)

## Payment Flow

1. User selects payment method
2. System calls Midtrans API to create transaction
3. User receives payment instructions (QR, VA number, etc.)
4. User completes payment
5. Midtrans sends webhook notification
6. System updates order status and reduces stock
7. User redirected to success page

## Error Handling

- Graceful fallback to mock data if Midtrans API fails
- Comprehensive error logging
- User-friendly error messages
- Automatic retry mechanisms
