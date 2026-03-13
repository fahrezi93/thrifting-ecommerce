const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Manually set credentials for verification
cloudinary.config({
    cloud_name: 'dsbdjzrin',
    api_key: '919524441966752',
    api_secret: '9hBqduC0NjVVRmDGu_smk04-Tcg',
    secure: true
});

console.log('Testing Cloudinary connection with explicit credentials...');

async function testUpload() {
    try {
        const result = await cloudinary.api.ping();
        console.log('✅ Connection ping successful:', result);
        
        // Try a tiny upload
        console.log('Attempting small test upload...');
        const uploadResult = await cloudinary.uploader.upload('https://via.placeholder.com/10', {
            folder: 'test_connection'
        });
        console.log('✅ Test upload successful:', uploadResult.secure_url);
    } catch (error) {
        console.error('❌ Cloudinary Error:', error.message);
        console.error('Full Error details:', JSON.stringify(error, null, 2));
    }
}

testUpload();
