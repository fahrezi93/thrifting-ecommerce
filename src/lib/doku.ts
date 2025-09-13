import crypto from 'crypto';

// Tipe data untuk header DOKU agar lebih mudah digunakan
interface DokuHeaders {
  'Client-Id': string;
  'Request-Id': string;
  'Request-Timestamp': string;
  'Signature': string;
  'Content-Type': 'application/json';
  [key: string]: string;
}

/**
 * Membuat header yang diperlukan untuk otentikasi DOKU API.
 * Proses ini sama seperti yang dijelaskan di video (Digest -> Signature).
 * @param requestBody - Body dari request yang akan dikirim (dalam format JSON string).
 * @param requestPath - Path dari API endpoint yang dituju (contoh: /checkout/v1/payment).
 * @returns Object berisi header yang dibutuhkan.
 */
export function generateDokuHeaders(requestBody: string, requestPath: string): DokuHeaders {
  const clientId = process.env.DOKU_CLIENT_ID!;
  const secretKey = process.env.DOKU_SECRET_KEY!;
  const requestId = Math.random().toString(36).substring(7); // Request ID unik seperti di video
  // DOKU memerlukan timestamp dalam format ISO 8601 dengan timezone UTC
  // Format: 2020-08-11T08:45:42Z (tanpa milidetik)
  const now = new Date();
  const requestTimestamp = now.toISOString().replace(/\.\d{3}Z$/, 'Z');

  console.log('DOKU Signature Generation Debug:', {
    clientId: clientId,
    secretKeyLength: secretKey.length,
    requestId: requestId,
    requestTimestamp: requestTimestamp,
    requestPath: requestPath,
    requestBodyLength: requestBody.length
  });

  // 1. Buat Digest dari Body
  const digest = crypto
    .createHash('sha256')
    .update(requestBody)
    .digest('base64');

  console.log('Digest:', digest);

  // 2. Gabungkan komponen untuk membuat Signature (sesuai dokumentasi DOKU)
  // Format yang benar: Client-Id + Request-Id + Request-Timestamp + Request-Target + Digest
  const signatureComponents =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${requestTimestamp}\n` +
    `Request-Target:${requestPath}\n` +
    `Digest:${digest}`;

  console.log('Signature Components:', signatureComponents);

  // 3. Buat Signature menggunakan HMACSHA256 dengan secret key
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(signatureComponents)
    .digest('base64');

  console.log('Generated Signature:', signature);

  return {
    'Client-Id': clientId,
    'Request-Id': requestId,
    'Request-Timestamp': requestTimestamp,
    'Signature': `HMACSHA256=${signature}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Memverifikasi signature dari DOKU webhook
 * @param signature - Signature dari header webhook
 * @param requestBody - Body dari webhook request
 * @param clientId - Client ID dari header
 * @param requestId - Request ID dari header
 * @param requestTimestamp - Request timestamp dari header
 * @returns Boolean apakah signature valid
 */
export function verifyDokuSignature(
  signature: string,
  requestBody: string,
  clientId: string,
  requestId: string,
  requestTimestamp: string
): boolean {
  const secretKey = process.env.DOKU_SECRET_KEY!;
  // Path webhook harus sesuai dengan yang kita buat
  const requestPath = '/api/webhooks/doku';

  const digest = crypto
    .createHash('sha256')
    .update(requestBody)
    .digest('base64');

  const components =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${requestTimestamp}\n` +
    `Request-Target:${requestPath}\n` +
    `Digest:${digest}`;

  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(components)
    .digest('base64');

  return `HMACSHA256=${expectedSignature}` === signature;
}

/**
 * Check transaction status from DOKU API
 * @param transactionId - Transaction ID from DOKU
 * @returns Transaction status information
 */
export async function checkDokuTransactionStatus(transactionId: string): Promise<{ status: string; transactionId: string } | null> {
  try {
    const baseUrl = process.env.DOKU_BASE_URL || 'https://api-sandbox.doku.com';
    const requestPath = `/checkout/v1/payment/${transactionId}`;
    
    // Create request body (empty for GET request)
    const requestBody = '';
    
    // Generate headers
    const headers = generateDokuHeaders(requestBody, requestPath);
    
    console.log('Checking DOKU transaction status:', {
      transactionId,
      requestPath,
      headers: {
        'Client-Id': headers['Client-Id'],
        'Request-Id': headers['Request-Id'],
        'Request-Timestamp': headers['Request-Timestamp']
      }
    });

    const response = await fetch(`${baseUrl}${requestPath}`, {
      method: 'GET',
      headers: {
        'Client-Id': headers['Client-Id'],
        'Request-Id': headers['Request-Id'],
        'Request-Timestamp': headers['Request-Timestamp'],
        'Signature': headers['Signature'],
        'Content-Type': headers['Content-Type'],
      },
    });

    if (!response.ok) {
      console.error('DOKU API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('DOKU transaction status response:', data);

    return {
      status: data.status || 'UNKNOWN',
      transactionId: data.id || transactionId
    };

  } catch (error) {
    console.error('Error checking DOKU transaction status:', error);
    return null;
  }
}
