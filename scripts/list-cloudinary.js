const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dsbdjzrin',
    api_key: '919524441966752',
    api_secret: '9hBqduC0NjVVRmDGu_smk04-Tcg',
    secure: true,
});

async function listResources() {
    try {
        console.log('Listing resources in folder: thrift-haven');
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'thrift-haven/',
            max_results: 50
        });
        
        console.log('--- CLOUDINARY ASSETS ---');
        result.resources.forEach(res => {
            console.log(`PublicID: ${res.public_id}`);
            console.log(`URL: ${res.secure_url}`);
            console.log('---');
        });
        console.log(`Total: ${result.resources.length}`);
    } catch (err) {
        console.error(err);
    }
}

listResources();
