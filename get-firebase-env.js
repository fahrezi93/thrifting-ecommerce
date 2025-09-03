// Script to help get Firebase Admin SDK JSON for Vercel environment variable
const fs = require('fs');
const path = require('path');

const firebaseFile = path.join(__dirname, 'thrifting-ecommerce-firebase-adminsdk-fbsvc-d9f4bfdff5.json');

try {
  if (fs.existsSync(firebaseFile)) {
    const firebaseConfig = fs.readFileSync(firebaseFile, 'utf8');
    
    // Validate it's valid JSON
    const parsed = JSON.parse(firebaseConfig);
    
    console.log('✅ Firebase Admin SDK file found and valid');
    console.log('📋 Copy the following JSON to your Vercel environment variable:');
    console.log('');
    console.log('Variable name: FIREBASE_ADMIN_SDK_JSON');
    console.log('Variable value (copy this entire JSON):');
    console.log('');
    console.log(firebaseConfig);
    console.log('');
    console.log('🔧 Steps to add to Vercel:');
    console.log('1. Go to https://vercel.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Settings > Environment Variables');
    console.log('4. Add new variable:');
    console.log('   - Name: FIREBASE_ADMIN_SDK_JSON');
    console.log('   - Value: (paste the JSON above)');
    console.log('   - Environment: Production, Preview, Development');
    console.log('5. Redeploy your application');
    
  } else {
    console.log('❌ Firebase Admin SDK file not found at:', firebaseFile);
    console.log('');
    console.log('Please ensure you have downloaded the Firebase Admin SDK JSON file');
    console.log('from the Firebase Console and placed it in the project root.');
  }
} catch (error) {
  console.log('❌ Error reading Firebase Admin SDK file:', error.message);
}
