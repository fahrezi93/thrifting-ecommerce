const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Verified credentials
cloudinary.config({
    cloud_name: 'dsbdjzrin',
    api_key: '919524441966752',
    api_secret: '9hBqduC0NjVVRmDGu_smk04-Tcg',
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
        console.log(`Found ${files.length} files. Starting migration...`);

        for (const file of files) {
            const filePath = path.join(uploadsDir, file);
            const ext = path.extname(file).toLowerCase();
            if (fs.lstatSync(filePath).isFile() && ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
                console.log(`Uploading ${file}...`);
                try {
                    const result = await cloudinary.uploader.upload(filePath, {
                        folder: targetFolder,
                        use_filename: true,
                        unique_filename: false,
                        resource_type: 'auto'
                    });
                    console.log(`✅ Success: ${file} -> ${result.secure_url}`);
                } catch (err) {
                    console.error(`❌ Failed ${file}: ${err.message}`);
                }
            }
        }
    } catch (error) {
        console.error('Migration crashed:', error);
    }
}

migrateImages();
