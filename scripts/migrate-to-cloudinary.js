const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Load .env manually if dotenv is not available globally
const envPath = path.join(process.cwd(), '.env');
console.log('Checking for .env at:', envPath);
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
            process.env[key] = value;
            if (key.includes('CLOUDINARY')) {
                console.log(`Loaded ${key}: ${value.substring(0, 4)}...`);
            }
        }
    });
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
const targetFolder = 'thrift-haven';

async function migrateImages() {
    try {
        if (!fs.existsSync(uploadsDir)) {
            console.error(`Directory not found: ${uploadsDir}`);
            return;
        }

        const files = fs.readdirSync(uploadsDir);
        console.log(`Found ${files.length} files in ${uploadsDir}. Starting migration...`);

        for (const file of files) {
            const filePath = path.join(uploadsDir, file);
            
            // Basic check to ensure it's a file and an image (by extension)
            const ext = path.extname(file).toLowerCase();
            if (fs.lstatSync(filePath).isFile() && ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
                console.log(`Attempting to upload ${file}...`);
                
                try {
                    const result = await cloudinary.uploader.upload(filePath, {
                        folder: targetFolder,
                        use_filename: true,
                        unique_filename: false,
                        resource_type: 'auto'
                    });
                    console.log(`✅ Success: ${file} -> ${result.secure_url}`);
                } catch (uploadError) {
                    console.error(`❌ Failed to upload ${file}:`, uploadError.message);
                    if (uploadError.message.includes('Invalid api_key')) {
                        console.error('CRITICAL: The API Key used was:', process.env.CLOUDINARY_API_KEY);
                    }
                }
            } else {
                console.log(`Skipping non-image file: ${file}`);
            }
        }

        console.log('🎉 Migration process finished!');
    } catch (error) {
        console.error('💥 Migration script crashed:', error);
    }
}

migrateImages();
