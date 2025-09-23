# Panduan Implementasi Pembayaran QRIS dengan DOKU

## Cara Kerja Pembayaran QRIS dengan DOKU (Secara Konsep)

Bayangkan proses ini seperti percakapan antara tiga pihak: **Pelanggan (Frontend)**, **Toko Anda (Backend)**, dan **DOKU (Payment Gateway)**.

### 🔄 Alur Kerja Pembayaran QRIS

#### 1. **Pelanggan Selesai Belanja**
Pelanggan menekan tombol "Bayar Sekarang" di halaman checkout Anda. Total harga, misalnya Rp 150.000, sudah final.

#### 2. **Toko Anda Meminta QR Code ke DOKU**
- Frontend Anda mengirim permintaan ke Backend Anda, isinya: "Tolong buatkan QRIS untuk Order #123 sejumlah Rp 150.000"
- Backend Anda menerima ini, lalu "berbicara" dengan server DOKU melalui API
- Pesannya: "Hai DOKU, saya Toko A. Tolong buatkan QRIS untuk orderId: 123 dengan total amount: 150000. Ini data keamanan saya (Client ID, Signature, dll)."

#### 3. **DOKU Membuat dan Mengirim QR Code**
- DOKU memverifikasi permintaan dari toko Anda
- Jika valid, DOKU akan membuat sebuah QR Code unik yang sudah berisi informasi tagihan (Rp 150.000) dan tujuan pembayaran (rekening toko Anda)
- DOKU kemudian memberikan kembali data QR code tersebut (biasanya dalam bentuk URL gambar atau string QR) ke Backend Anda

#### 4. **Toko Anda Menampilkan QR Code ke Pelanggan**
- Backend Anda menerima data QR dari DOKU, lalu memberikannya ke Frontend
- Frontend Anda menampilkan gambar QR Code tersebut di layar pelanggan, beserta instruksi dan batas waktu pembayaran

#### 5. **Pelanggan Membayar**
Pelanggan membuka aplikasi m-banking atau e-wallet (GoPay, OVO, Dana, dll.), memindai QR code, dan menyelesaikan pembayaran.

#### 6. **DOKU Memberi Tahu Toko Anda (Webhook)**
- Setelah pembayaran berhasil, server DOKU secara otomatis mengirim "notifikasi" (disebut Webhook atau HTTP Notification) ke sebuah alamat URL khusus di Backend Anda
- Isi notifikasinya: "Pembayaran untuk Order #123 sejumlah Rp 150.000 sudah berhasil."

#### 7. **Toko Anda Memperbarui Status Pesanan**
- Backend Anda menerima notifikasi dari DOKU, memverifikasi keasliannya, lalu mengubah status Order #123 di database Anda dari `PENDING` menjadi `PAID`
- Proses selesai. Anda bisa mulai mengemas barang pesanan tersebut.

---

## 🛠️ Cara Membuat Sistemnya (Langkah-langkah Teknis)

### Langkah 1: Persiapan Awal di DOKU

#### 1.1 Daftar Akun Merchant DOKU
Buat akun di situs DOKU untuk mendapatkan akses ke layanan pembayaran.

#### 1.2 Dapatkan Kredensial API
Setelah akun Anda aktif (biasanya di lingkungan Sandbox untuk development), Anda akan mendapatkan:
- **Client ID**: Identitas unik toko Anda
- **Secret Key**: Kunci rahasia untuk membuat signature

> **Catatan**: DOKU mungkin menggunakan istilah yang sedikit berbeda, seperti Private Key untuk signature, jadi pastikan Anda membaca dokumentasi API mereka.

#### 1.3 Simpan Kredensial dengan Aman
Simpan Client ID dan Secret Key di environment variables (`.env.local`) di proyek Next.js Anda. **Jangan pernah menaruhnya langsung di dalam kode**.

```bash
# .env.local
DOKU_CLIENT_ID="your-client-id"
DOKU_SECRET_KEY="your-secret-key"
DOKU_API_URL="https://api-sandbox.doku.com" # URL untuk sandbox
```

---

### Langkah 2: Buat API Endpoint di Backend untuk Generate QRIS

Buat sebuah API route baru di Next.js, misalnya di `src/app/api/payment/create-doku-qris/route.ts`. Endpoint ini akan bertanggung jawab untuk berkomunikasi dengan DOKU.

```typescript
// src/app/api/payment/create-doku-qris/route.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount } = await request.json();

    // 1. Siapkan Kredensial
    const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID;
    const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY;
    const DOKU_API_URL = process.env.DOKU_API_URL;

    if (!DOKU_CLIENT_ID || !DOKU_SECRET_KEY || !DOKU_API_URL) {
      throw new Error('DOKU credentials not configured');
    }

    // 2. Buat Request Headers dan Body sesuai dokumentasi DOKU
    const requestId = `qris-${Date.now()}`; // ID unik untuk setiap request
    const requestTimestamp = new Date().toISOString();
    const requestTarget = "/qris-v2/generate-qris-emv-mpm"; // Contoh target path dari DOKU

    const requestBody = {
      partnerReferenceNo: orderId,
      amount: {
        value: `${amount.toFixed(2)}`, // Harus dalam format string dengan 2 desimal
        currency: "IDR",
      },
      merchantId: DOKU_CLIENT_ID,
      subMerchantId: DOKU_CLIENT_ID,
      terminalId: "12345678",
      // tambahkan parameter lain sesuai kebutuhan dari dokumentasi DOKU
    };

    // 3. Buat Digital Signature (SANGAT PENTING)
    // DOKU memiliki format khusus untuk membuat signature.
    // Biasanya gabungan dari beberapa header dan body request yang di-hash.
    const digest = crypto.createHash('sha256').update(JSON.stringify(requestBody)).digest('base64');
    const stringToSign = `Client-Id:${DOKU_CLIENT_ID}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;

    const signature = crypto.createSign('RSA-SHA256').update(stringToSign).sign(DOKU_SECRET_KEY, 'base64');

    // 4. Kirim Permintaan ke DOKU
    const response = await fetch(`${DOKU_API_URL}${requestTarget}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': DOKU_CLIENT_ID,
        'Request-Id': requestId,
        'Request-Timestamp': requestTimestamp,
        'Signature': `RSA256=${signature}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gagal membuat QRIS DOKU');
    }

    const data = await response.json();
    
    // 5. Kirim kembali URL QRIS ke Frontend
    return NextResponse.json({ 
      qrCodeUrl: data.virtualAccountInfo?.qrString || data.qrString,
      referenceNo: data.referenceNo,
      expiredDate: data.expiredDate
    });

  } catch (error) {
    console.error('DOKU QRIS Error:', error);
    return NextResponse.json({ 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
```

---

### Langkah 3: Tampilkan QR Code di Frontend

Di halaman checkout Anda, saat pengguna menekan tombol bayar, panggil API endpoint yang baru saja Anda buat.

```typescript
// Di dalam komponen halaman checkout Anda (misal: src/app/checkout/page.tsx)

import { useState } from 'react';
import Image from 'next/image';

interface QRISData {
  qrCodeUrl: string;
  referenceNo: string;
  expiredDate: string;
}

function CheckoutPage() {
  const [qrisData, setQrisData] = useState<QRISData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayWithQRIS = async (orderId: string, totalAmount: number) => {
    setIsLoading(true);
    setQrisData(null);
    setError('');

    try {
      const response = await fetch('/api/payment/create-doku-qris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount: totalAmount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mendapatkan QR Code');
      }

      const data = await response.json();
      setQrisData(data);

    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      
      {/* Tampilkan detail pesanan */}
      <div className="mb-6">
        <p className="text-lg">Total: Rp 150.000</p>
        <p className="text-sm text-gray-600">Order ID: ORDER-123</p>
      </div>

      <button 
        onClick={() => handlePayWithQRIS('ORDER-123', 150000)} 
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg disabled:opacity-50"
      >
        {isLoading ? 'Memproses...' : 'Bayar dengan QRIS'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {qrisData && (
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold mb-3">Pindai QR Code untuk Membayar</h3>
          
          <div className="bg-white p-4 rounded-lg shadow-md inline-block">
            <Image 
              src={qrisData.qrCodeUrl} 
              alt="QRIS Code" 
              width={200} 
              height={200}
              className="mx-auto"
            />
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Reference No: {qrisData.referenceNo}</p>
            <p>Batas waktu: {new Date(qrisData.expiredDate).toLocaleString('id-ID')}</p>
            <p className="mt-2 font-medium">
              Gunakan aplikasi mobile banking atau e-wallet Anda untuk memindai QR code di atas
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
```

---

### Langkah 4: Buat API Endpoint untuk Menerima Notifikasi (Webhook)

Ini adalah langkah krusial untuk mengonfirmasi pembayaran secara otomatis.

```typescript
// src/app/api/payment/doku-notification/route.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma'; // Sesuaikan dengan setup Prisma Anda

export async function POST(request: NextRequest) {
  try {
    const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID;
    const DOKU_PUBLIC_KEY = process.env.DOKU_PUBLIC_KEY; // Public key untuk verifikasi
    
    if (!DOKU_CLIENT_ID || !DOKU_PUBLIC_KEY) {
      throw new Error('DOKU credentials not configured');
    }

    // 1. Ambil data notifikasi dari DOKU
    const notificationBody = await request.json();
    const headers = request.headers;
    
    console.log('DOKU Notification received:', notificationBody);
    
    // 2. Verifikasi Signature (SANGAT PENTING UNTUK KEAMANAN)
    const clientId = headers.get('Client-Id');
    const requestId = headers.get('Request-Id');
    const requestTimestamp = headers.get('Request-Timestamp');
    const signature = headers.get('Signature');
    
    if (clientId !== DOKU_CLIENT_ID) {
      throw new Error('Invalid Client ID');
    }
    
    // Buat string untuk verifikasi signature
    const digest = crypto.createHash('sha256').update(JSON.stringify(notificationBody)).digest('base64');
    const stringToVerify = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nDigest:${digest}`;
    
    // Verifikasi signature menggunakan public key DOKU
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(stringToVerify);
    const isValidSignature = verify.verify(DOKU_PUBLIC_KEY, signature?.replace('RSA256=', '') || '', 'base64');
    
    if (!isValidSignature) {
      throw new Error('Invalid signature');
    }
    
    // 3. Proses Notifikasi
    const orderId = notificationBody.order?.invoiceNumber || notificationBody.partnerReferenceNo;
    const status = notificationBody.transaction?.status || notificationBody.transactionStatus;
    const amount = notificationBody.amount?.value || notificationBody.transactionAmount;

    console.log(`Processing notification for Order ${orderId} with status ${status}`);

    // 4. Update status pesanan di database PostgreSQL
    if (status === 'SUCCESS' || status === 'PAID' || status === 'SETTLEMENT') {
      
      // Update order status menggunakan Prisma
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'PAID',
          paidAt: new Date(),
          paymentMethod: 'QRIS_DOKU'
        },
      });

      console.log(`Order ${orderId} telah berhasil dibayar.`);
      
      // Optional: Kirim notifikasi real-time ke user menggunakan Pusher
      // await pusher.trigger(`user-${updatedOrder.userId}`, 'payment-success', {
      //   orderId: orderId,
      //   message: 'Pembayaran berhasil! Pesanan Anda sedang diproses.'
      // });
      
    } else if (status === 'FAILED' || status === 'EXPIRED' || status === 'CANCELLED') {
      
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'FAILED',
          paymentMethod: 'QRIS_DOKU'
        },
      });

      console.log(`Order ${orderId} pembayaran gagal atau expired.`);
    }

    // 5. Beri respons sukses ke DOKU agar tidak mengirim notifikasi berulang
    return NextResponse.json({ 
      responseCode: '2000000',
      responseMessage: 'SUCCESS' 
    });
  
  } catch (error) {
    console.error('DOKU Notification Error:', error);
    return NextResponse.json({ 
      responseCode: '4000000',
      responseMessage: 'FAILED',
      error: (error as Error).message
    }, { status: 500 });
  }
}
```

---

## 🔧 Konfigurasi Tambahan

### 1. Environment Variables Lengkap

```bash
# .env.local

# DOKU Configuration
DOKU_CLIENT_ID="your-doku-client-id"
DOKU_SECRET_KEY="your-doku-secret-key"
DOKU_PUBLIC_KEY="your-doku-public-key"
DOKU_API_URL="https://api-sandbox.doku.com"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/your_db"

# Pusher (Optional - untuk real-time notifications)
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="your-pusher-cluster"
```

### 2. Daftarkan Webhook URL di Dashboard DOKU

Setelah deploy aplikasi Anda, daftarkan URL webhook di dashboard merchant DOKU:

```
https://your-domain.com/api/payment/doku-notification
```

### 3. Testing di Development

Untuk testing di development, gunakan ngrok untuk expose localhost:

```bash
# Install ngrok
npm install -g ngrok

# Expose port 3000
ngrok http 3000

# Gunakan URL ngrok untuk webhook
https://abc123.ngrok.io/api/payment/doku-notification
```

---

## 🔒 Keamanan dan Best Practices

### 1. **Selalu Verifikasi Signature**
- Jangan pernah skip verifikasi signature pada webhook
- Gunakan public key DOKU untuk memverifikasi keaslian notifikasi

### 2. **Simpan Kredensial dengan Aman**
- Jangan hardcode API keys di dalam kode
- Gunakan environment variables
- Jangan commit file `.env` ke repository

### 3. **Logging dan Monitoring**
- Log semua transaksi dan notifikasi
- Monitor webhook failures
- Set up alerting untuk transaksi gagal

### 4. **Idempotency**
- Pastikan webhook handler bersifat idempotent
- Cek apakah order sudah diproses sebelumnya
- Hindari double processing

### 5. **Timeout Handling**
- Set timeout yang wajar untuk API calls ke DOKU
- Implement retry mechanism untuk failed requests
- Handle network errors gracefully

---

## 📋 Checklist Implementasi

- [ ] Daftar akun merchant DOKU
- [ ] Dapatkan kredensial API (Client ID, Secret Key, Public Key)
- [ ] Setup environment variables
- [ ] Buat API endpoint untuk generate QRIS
- [ ] Buat UI untuk menampilkan QR code
- [ ] Buat webhook endpoint untuk notifikasi
- [ ] Implement signature verification
- [ ] Update database schema untuk payment tracking
- [ ] Deploy aplikasi ke production
- [ ] Daftarkan webhook URL di dashboard DOKU
- [ ] Test end-to-end payment flow
- [ ] Setup monitoring dan logging
- [ ] Implement error handling dan retry logic

---

## 🚀 Deployment Notes

1. **Vercel Deployment**: Pastikan semua environment variables sudah di-set di Vercel dashboard
2. **Database Migration**: Jalankan `npx prisma db push` setelah deploy
3. **Webhook Registration**: Update webhook URL di DOKU dashboard dengan domain production
4. **SSL Certificate**: Pastikan domain menggunakan HTTPS (required oleh DOKU)

---

## 📞 Support dan Dokumentasi

- [DOKU Developer Documentation](https://developers.doku.com)
- [DOKU API Reference](https://developers.doku.com/api)
- [DOKU Sandbox Environment](https://sandbox.doku.com)

---

**Catatan**: Dokumentasi ini berdasarkan konsep umum implementasi DOKU QRIS. Selalu rujuk ke dokumentasi resmi DOKU untuk detail teknis terbaru dan parameter API yang akurat.
