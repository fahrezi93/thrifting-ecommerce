# DOKU Webhook Debugging Guide

## 🔍 Masalah Umum & Solusi

### 1. Konfigurasi URL Webhook di Dashboard DOKU

**Masalah Paling Umum:** URL webhook tidak dikonfigurasi dengan benar di dashboard DOKU.

#### ✅ Langkah-langkah:
1. Login ke [DOKU Sandbox Dashboard](https://dashboard-sandbox.doku.com)
2. Masuk ke menu **Settings > Notifications**
3. Pastikan **URL Notification** terisi dengan:
   ```
   https://your-domain.com/api/webhooks/doku
   ```

#### 🚨 Untuk Development Lokal:
Server DOKU tidak bisa mengirim ke `localhost`. Gunakan **ngrok**:

```bash
# Install ngrok
npm install -g ngrok

# Jalankan server Next.js
npm run dev

# Di terminal baru, expose port 3000
ngrok http 3000
```

Gunakan URL ngrok di dashboard DOKU:
```
https://1234abcd.ngrok.io/api/webhooks/doku
```

### 2. Verifikasi Signature Gagal

#### 🔐 Cek Environment Variables:
```bash
# Pastikan ada di .env
DOKU_CLIENT_ID=your_client_id
DOKU_SECRET_KEY=your_secret_key
```

#### 📋 Log yang Akan Muncul:
```
✅ DOKU Webhook: Signature verified successfully!
```

Jika gagal:
```
❌ DOKU Webhook: Invalid signature. Verification failed.
```

### 3. Order Tidak Ditemukan

#### 🔍 Cek Database:
Log akan menampilkan:
```
🔍 Searching for order with orderNumber: ORD-123456
✅ Order found in database: { id: "...", orderNumber: "ORD-123456" }
```

Jika tidak ditemukan:
```
❌ Order with ID/orderNumber ORD-123456 not found in database
Available orders in database (last 5): [...]
```

## 🧪 Testing Webhook

### Manual Testing dengan cURL:

```bash
curl -X POST http://localhost:3000/api/webhooks/doku \
  -H "Content-Type: application/json" \
  -H "Signature: test-signature" \
  -H "Client-Id: your-client-id" \
  -H "Request-Id: test-request-123" \
  -H "Request-Timestamp: 2024-01-01T00:00:00Z" \
  -d '{
    "transaction": {
      "id": "TXN-123456",
      "status": "SUCCESS"
    },
    "order": {
      "invoice_number": "ORD-123456"
    }
  }'
```

### Expected Response:
```json
{
  "message": "Webhook processed successfully"
}
```

## 📊 Monitoring Logs

### 1. Jalankan Server dengan Logging:
```bash
npm run dev
```

### 2. Cek Terminal untuk Log:
```
=== DOKU WEBHOOK RECEIVED ===
Timestamp: 2024-01-01T00:00:00.000Z
Raw Body Text: {"transaction":{"id":"TXN-123","status":"SUCCESS"}...}
DOKU Webhook Headers: {
  signature: "abc123...",
  clientId: "your-client-id",
  requestId: "req-123",
  requestTimestamp: "2024-01-01T00:00:00Z"
}
🔐 Starting signature verification...
✅ DOKU Webhook: Signature verified successfully!
📋 DOKU Webhook - Processing transaction: {
  invoiceNumber: "ORD-123456",
  status: "SUCCESS",
  transactionId: "TXN-123"
}
🔍 Searching for order with orderNumber: ORD-123456
✅ Order found in database: {
  id: "order-uuid",
  orderNumber: "ORD-123456",
  currentStatus: "PENDING"
}
🔄 Processing status update...
📝 Updating order ORD-123456 status from PENDING to PAID
✅ Order ORD-123456 status successfully updated to PAID
📱 Notification sent to user user-123 for order ORD-123456 (PAID)
```

## 🔧 Troubleshooting Checklist

### ✅ Environment Setup:
- [ ] DOKU credentials configured in `.env`
- [ ] Pusher credentials configured (optional)
- [ ] Database connection working

### ✅ DOKU Dashboard:
- [ ] Webhook URL configured correctly
- [ ] Using correct sandbox/production credentials
- [ ] Notification settings enabled

### ✅ Local Development:
- [ ] ngrok running and URL updated in DOKU dashboard
- [ ] Server running on correct port
- [ ] Firewall not blocking incoming requests

### ✅ Database:
- [ ] Order exists with correct `orderNumber`
- [ ] Order belongs to authenticated user
- [ ] Order status is not already `PAID`

## 🚨 Common Error Messages

### "Missing required headers"
```json
{ "error": "Missing required headers" }
```
**Solution:** DOKU tidak mengirim header yang diperlukan. Cek konfigurasi di dashboard DOKU.

### "Invalid signature"
```json
{ "error": "Invalid signature" }
```
**Solution:** 
1. Cek `DOKU_SECRET_KEY` di `.env`
2. Pastikan signature verification logic benar
3. Cek timestamp tidak expired

### "Order not found"
```json
{ 
  "error": "Order with ID/orderNumber ORD-123456 not found",
  "searchedFor": "ORD-123456",
  "recentOrders": [...]
}
```
**Solution:**
1. Cek apakah `invoice_number` di DOKU sama dengan `orderNumber` di database
2. Pastikan order sudah dibuat sebelum payment
3. Cek case sensitivity

## 📱 Real-time Notifications

### Pusher Configuration:
```env
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster
```

### Expected Notification:
```javascript
// Frontend akan menerima:
{
  id: "notification-id",
  userId: "user-123",
  message: "Pembayaran berhasil! Pesanan #ORD-123456 sedang diproses",
  url: "/dashboard/orders/order-uuid",
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

## 🎯 Next Steps

1. **Test Payment Flow:**
   - Buat order baru
   - Lakukan pembayaran via DOKU
   - Monitor logs di terminal
   - Cek status update di database

2. **Verify Notifications:**
   - Cek notifikasi real-time di frontend
   - Pastikan status order terupdate
   - Test dengan berbagai status (SUCCESS, FAILED)

3. **Production Setup:**
   - Ganti ke production credentials
   - Update webhook URL ke domain production
   - Monitor error logs di production
