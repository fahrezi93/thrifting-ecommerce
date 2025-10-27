/**
 * Test script untuk memverifikasi Firebase Admin SDK configuration
 * Run: node test-firebase-admin.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Firebase Admin SDK Configuration...\n');

// Test 1: Check if file exists
const filePath = path.join(process.cwd(), 'thrifting-ecommerce-firebase-adminsdk-fbsvc-b4f7b03bf2.json');
console.log('1. Checking file path:', filePath);

if (fs.existsSync(filePath)) {
  console.log('   ✅ File exists\n');
  
  // Test 2: Read and parse file
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log('2. File size:', fileContent.length, 'bytes');
    
    const serviceAccount = JSON.parse(fileContent);
    console.log('   ✅ Valid JSON\n');
    
    // Test 3: Check required fields
    console.log('3. Checking required fields:');
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    let allFieldsPresent = true;
    
    requiredFields.forEach(field => {
      if (serviceAccount[field]) {
        console.log(`   ✅ ${field}: ${field === 'private_key' ? '[PRESENT]' : serviceAccount[field]}`);
      } else {
        console.log(`   ❌ ${field}: MISSING`);
        allFieldsPresent = false;
      }
    });
    
    if (allFieldsPresent) {
      console.log('\n✅ Firebase Admin SDK configuration is valid!');
      console.log('\n📋 Summary:');
      console.log('   Project ID:', serviceAccount.project_id);
      console.log('   Client Email:', serviceAccount.client_email);
      console.log('   Type:', serviceAccount.type);
    } else {
      console.log('\n❌ Configuration is incomplete!');
      process.exit(1);
    }
    
  } catch (error) {
    console.log('   ❌ Error parsing JSON:', error.message);
    process.exit(1);
  }
  
} else {
  console.log('   ❌ File not found!');
  console.log('\n📝 Please ensure the file exists at:', filePath);
  process.exit(1);
}
