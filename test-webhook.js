const fetch = require('node-fetch');

async function testWebhook() {
  const webhookUrl = 'https://thrifting-haven.vercel.app/api/payment/doku/webhook';
  
  // Test data sesuai format DOKU SNAP
  const testData = {
    trxId: 'cmfqmhpl20003ulucvghca8ly', // Order number dari screenshot
    paymentRequestId: '12345678',
    paidAmount: {
      value: '100000.00',
      currency: 'IDR'
    },
    virtualAccountName: 'Test Customer',
    partnerServiceId: '77777',
    customerNo: '0000000001'
  };

  try {
    console.log('Testing webhook with data:', testData);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TIMESTAMP': new Date().toISOString(),
        'X-SIGNATURE': 'test-signature',
        'X-PARTNER-ID': '821508239190',
        'X-EXTERNAL-ID': '418075533589'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', result);

  } catch (error) {
    console.error('Error testing webhook:', error);
  }
}

testWebhook();
