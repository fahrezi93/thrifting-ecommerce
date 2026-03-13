const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mapping of filename to Cloudinary URL (based on your account structure)
// Since we used use_filename: true, it will be in thrift-haven/filename
const CLOUDINARY_BASE = 'https://res.cloudinary.com/dsbdjzrin/image/upload/v1/thrift-haven/';

const localToCloudinary = {
    "01-ADIDAS-AFAV6ADI5-ADIIC7428-Black.jpg": CLOUDINARY_BASE + "01-ADIDAS-AFAV6ADI5-ADIIC7428-Black",
    "01-LILY-LFCCPLLY0-32130189-Grey_89217032-e08b-490c-9907-1f3b2309c7dd.jpg": CLOUDINARY_BASE + "01-LILY-LFCCPLLY0-32130189-Grey_89217032-e08b-490c-9907-1f3b2309c7dd",
    "0888-REEMPO2512NV-1.jpg": CLOUDINARY_BASE + "0888-REEMPO2512NV-1",
    "0888-REEWPT2521DR-1.jpg": CLOUDINARY_BASE + "0888-REEWPT2521DR-1",
    "85170606-1.jpg": CLOUDINARY_BASE + "85170606-1",
    "CarrierCompany29-25-11-21-17Cumin.jpg": CLOUDINARY_BASE + "CarrierCompany29-25-11-21-17Cumin",
    "Men's-Football-Training-Pants.jpg": CLOUDINARY_BASE + "Men_s-Football-Training-Pants",
    "adidas_adidas_men_running_shoes_galaxy_7_sepatu_lari_pria_-id8757-_full06_n1jpnjvc.jpeg": CLOUDINARY_BASE + "adidas_adidas_men_running_shoes_galaxy_7_sepatu_lari_pria_-id8757-_full06_n1jpnjvc",
    "eljdp00106_element,f_bnt0_frt1.jpg": CLOUDINARY_BASE + "eljdp00106_element_f_bnt0_frt1",
    "product-1756896092198.jpg": CLOUDINARY_BASE + "product-1756896092198"
};

async function updateDatabase() {
    try {
        console.log('🔄 Updating database with Cloudinary URLs...');

        // Update Products
        const products = await prisma.product.findMany();
        for (const product of products) {
            let urls = JSON.parse(product.imageUrls);
            let updated = false;

            const newUrls = urls.map(url => {
                // If it's a local path or placeholder, try to find a match
                const filename = url.split('/').pop().split('?')[0];
                if (localToCloudinary[filename]) {
                    updated = true;
                    return localToCloudinary[filename];
                }
                // If it was already a Cloudinary URL from before, keep it
                return url;
            });

            if (updated) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: { imageUrls: JSON.stringify(newUrls) }
                });
                console.log(`✅ Updated product: ${product.name}`);
            }
        }

        console.log('🎉 Database update complete!');
    } catch (error) {
        console.error('💥 Update failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateDatabase();
