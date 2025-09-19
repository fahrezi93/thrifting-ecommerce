# DOKU Webhook Setup Guide

## Overview
Untuk menerima notifikasi pembayaran dari DOKU, Anda perlu mengkonfigurasi webhook URL di dashboard DOKU.

## Webhook Endpoint
```
POST https://yourdomain.com/api/payment/doku/webhook
```

## Setup Steps

### 1. Deploy Aplikasi ke Production
Pastikan aplikasi sudah di-deploy ke server yang dapat diakses publik (Vercel, Netlify, dll).

### 2. Konfigurasi di DOKU Dashboard

#### Untuk Sandbox (Testing):
1. Login ke DOKU **Sandbox** dashboard: https://sandbox.doku.com
2. Masuk ke **Settings** → **Payment Settings**
3. Pilih payment method yang Anda gunakan:
   - **Virtual Account SNAP**: Settings → Payment Settings → Virtual Account SNAP → CONFIGURE
   - **Virtual Account**: Settings → Payment Settings → Virtual Account → CONFIGURE  
   - **Cards**: Settings → Payment Settings → Cards → Tab Payment Configuration
   - **e-Wallet**: Settings → Payment Settings → e-Wallet → CONFIGURE
   - **Convenience Store**: Settings → Payment Settings → Convenience Store → CONFIGURE
4. Masukkan **Notification URL**: `https://yourdomain.com/api/payment/doku/webhook`

#### Untuk Production:
1. Login ke DOKU **Production** dashboard: https://dashboard.doku.com
2. Ikuti langkah yang sama seperti sandbox
3. Pastikan menggunakan production secret key

#### ⚠️ **Penting untuk Development:**
- **DOKU tidak mendukung ngrok domain** untuk security reasons
- Gunakan **localhost.run** untuk development testing
- Atau deploy ke staging server dengan HTTPS

### 3. Environment Variables
Tambahkan di `.env`:
```
# DOKU Configuration
DOKU_SECRET_KEY=your_doku_secret_key_here
DOKU_ENVIRONMENT=sandbox  # atau "production"
DOKU_SANDBOX_SECRET_KEY=your_sandbox_secret_key
DOKU_PRODUCTION_SECRET_KEY=your_production_secret_key
```

### 4. Testing Webhook
Untuk testing di development:
1. Gunakan ngrok untuk expose localhost:
   ```bash
   ngrok http 3000
   ```
2. Gunakan URL ngrok sebagai webhook URL di DOKU dashboard

## Webhook Payload Format

### DOKU SNAP Format (Recommended)
```json
{
  "partnerServiceId": "77777",
  "customerNo": "0000000000001",
  "virtualAccountNo": "777770000000000001",
  "virtualAccountName": "Customer Name",
  "trxId": "23219829713",
  "paymentRequestId": "12839218738127830",
  "paidAmount": {
    "value": "175000.00",
    "currency": "IDR"
  },
  "virtualAccountEmail": "customer@email.com",
  "virtualAccountPhone": "081293912081"
}
```

### Legacy Format (Fallback)
```json
{
  "order_id": "order_number_dari_aplikasi",
  "invoice_number": "DOKU_invoice_number",
  "amount": "175000.00",
  "status": "success",
  "transaction_status": "settlement",
  "payment_channel": "credit_card"
}
```

## Status Mapping
| DOKU Format | Condition | App Status |
|-------------|-----------|------------|
| SNAP | `paidAmount.value` exists | PAID |
| Legacy | success, paid, settlement, capture | PAID |
| Legacy | pending, challenge | PENDING |
| Legacy | failed, deny, cancel, expire | FAILED |

## Logging
Semua webhook notifications akan di-log ke tabel `PaymentLog` untuk debugging dan audit.

## Security
- Webhook endpoint memverifikasi signature dari DOKU (jika tersedia)
- Semua request di-log untuk audit trail
- Error handling untuk mencegah webhook retry yang berlebihan

## Troubleshooting

### Order Status Tidak Update
1. Cek log di console untuk webhook notifications
2. Pastikan order_id di DOKU sesuai dengan orderNumber di database
3. Verifikasi webhook URL sudah benar di DOKU dashboard

### Webhook Tidak Diterima
1. Pastikan aplikasi accessible dari internet
2. Cek firewall/security group settings
3. Test webhook endpoint dengan curl:
   ```bash
   curl -X POST https://yourdomain.com/api/payment/doku/webhook \
     -H "Content-Type: application/json" \
     -d '{"order_id":"test","status":"success"}'
   ```

## Sandbox vs Production

### Sandbox Environment (Untuk Testing)
- **Dashboard**: https://sandbox.doku.com
- **Environment Variable**: `DOKU_ENVIRONMENT=sandbox`
- **Secret Key**: Gunakan `DOKU_SANDBOX_SECRET_KEY`
- **Testing**: Gunakan test credit card numbers dari DOKU
- **Webhook**: Bisa menggunakan ngrok untuk localhost

### Production Environment
- **Dashboard**: https://dashboard.doku.com  
- **Environment Variable**: `DOKU_ENVIRONMENT=production`
- **Secret Key**: Gunakan `DOKU_PRODUCTION_SECRET_KEY`
- **Live Payments**: Real credit card transactions
- **Webhook**: Harus menggunakan HTTPS public URL

## Development Testing
Untuk testing di localhost dengan sandbox:

### Opsi 1: Menggunakan localhost.run (Recommended)
```bash
# Start aplikasi
npm run dev

# Di terminal baru, expose dengan localhost.run
ssh -R 80:localhost:3000 nokey@localhost.run

# Copy URL yang muncul dan tambahkan path webhook
# Contoh: https://abc123.localhost.run/api/payment/doku/webhook
```

### Opsi 2: Deploy ke Staging Server
1. Deploy ke Vercel/Netlify dengan subdomain staging
2. Gunakan URL staging untuk webhook testing
3. Set environment variables di platform hosting

### Environment Variables untuk Testing:
```env
DOKU_ENVIRONMENT=sandbox
DOKU_SANDBOX_SECRET_KEY=your_sandbox_secret_key
```
