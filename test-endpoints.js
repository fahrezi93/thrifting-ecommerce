// Simple test script to check if endpoints are working
const https = require('https');

const VERCEL_URL = 'https://thrifting-ecommerce.vercel.app'; // Update with your actual Vercel URL

async function testEndpoint(path, method = 'GET', headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'thrifting-ecommerce.vercel.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing endpoints...\n');

  // Test Firebase debugging endpoint
  try {
    console.log('1. Testing /api/test-firebase');
    const firebaseTest = await testEndpoint('/api/test-firebase');
    console.log(`Status: ${firebaseTest.status}`);
    if (firebaseTest.body) {
      const parsed = JSON.parse(firebaseTest.body);
      console.log('Firebase Admin Status:', parsed.success ? 'SUCCESS' : 'FAILED');
      if (parsed.status) {
        console.log('Has Environment Variable:', parsed.status.hasEnvVar);
        console.log('Initialization Error:', parsed.status.initializationError || 'None');
      }
    }
    console.log('');
  } catch (error) {
    console.log('Firebase test failed:', error.message);
    console.log('');
  }

  // Test featured products endpoint
  try {
    console.log('2. Testing /api/products/featured');
    const featuredTest = await testEndpoint('/api/products/featured');
    console.log(`Status: ${featuredTest.status}`);
    if (featuredTest.status === 200) {
      console.log('Featured products endpoint: SUCCESS');
    } else {
      console.log('Featured products endpoint: FAILED');
      console.log('Response:', featuredTest.body);
    }
    console.log('');
  } catch (error) {
    console.log('Featured products test failed:', error.message);
    console.log('');
  }

  // Test sync user endpoint (POST)
  try {
    console.log('3. Testing /api/auth/sync-user (POST)');
    const syncTest = await testEndpoint('/api/auth/sync-user', 'POST');
    console.log(`Status: ${syncTest.status}`);
    if (syncTest.status === 400) {
      console.log('Sync user endpoint: SUCCESS (expected 400 for missing data)');
    } else {
      console.log('Sync user endpoint response:', syncTest.body);
    }
    console.log('');
  } catch (error) {
    console.log('Sync user test failed:', error.message);
    console.log('');
  }

  console.log('Test completed!');
}

runTests().catch(console.error);
