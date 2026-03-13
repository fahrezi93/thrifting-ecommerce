const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CLOUDINARY_BASE = 'https://res.cloudinary.com/dsbdjzrin/image/upload/v1/thrift-haven/';

const assets = [
    "01-ADIDAS-AFAV6ADI5-ADIIC7428-Black",
    "01-LILY-LFCCPLLY0-32130189-Grey_89217032-e08b-490c-9907-1f3b2309c7dd",
    "0888-REEMPO2512NV-1",
    "0888-REEWPT2521DR-1",
    "85170606-1",
    "CarrierCompany29-25-11-21-17Cumin",
    "Men_s-Football-Training-Pants",
    "adidas_adidas_men_running_shoes_galaxy_7_sepatu_lari_pria_-id8757-_full06_n1jpnjvc",
    "eljdp00106_element_f_bnt0_frt1",
    "product-1756896092198"
];

async function intelligentUpdate() {
    try {
        console.log('🧠 Starting Intelligent Database Update with Extensions...');
        const products = await prisma.product.findMany();
        
        for (const product of products) {
            const name = (product.name || '').toLowerCase();
            const brand = (product.brand || '').toLowerCase();
            const desc = (product.description || '').toLowerCase();
            let matchedUrl = null;

            // Find best match in assets
            if (name.includes('adidas') || brand.includes('adidas')) {
                matchedUrl = CLOUDINARY_BASE + "01-ADIDAS-AFAV6ADI5-ADIIC7428-Black.jpg";
                if (name.includes('shoes') || name.includes('lari')) {
                    matchedUrl = CLOUDINARY_BASE + "adidas_adidas_men_running_shoes_galaxy_7_sepatu_lari_pria_-id8757-_full06_n1jpnjvc.jpeg";
                }
            } else if (name.includes('reebok') || brand.includes('reebok')) {
                matchedUrl = CLOUDINARY_BASE + "0888-REEMPO2512NV-1.jpg";
            } else if (name.includes('uniqlo') || brand.includes('uniqlo')) {
                matchedUrl = CLOUDINARY_BASE + "85170606-1.jpg";
            } else if (name.includes('carrier') || name.includes('cardigan')) {
                matchedUrl = CLOUDINARY_BASE + "CarrierCompany29-25-11-21-17Cumin.jpg";
            } else if (name.includes('training') || name.includes('shirt')) {
                matchedUrl = CLOUDINARY_BASE + "eljdp00106_element_f_bnt0_frt1.jpg";
                if (name.includes('pants')) {
                    matchedUrl = CLOUDINARY_BASE + "Men_s-Football-Training-Pants.jpg";
                }
            } else if (name.includes('pants') || name.includes('jeans')) {
                matchedUrl = CLOUDINARY_BASE + "Men_s-Football-Training-Pants.jpg";
            } else if (name.includes('grey') || name.includes('lily')) {
                matchedUrl = CLOUDINARY_BASE + "01-LILY-LFCCPLLY0-32130189-Grey_89217032-e08b-490c-9907-1f3b2309c7dd.jpg";
            }

            // Fallback to a generic product image if no match
            if (!matchedUrl) {
                matchedUrl = CLOUDINARY_BASE + "product-1756896092198.jpg";
            }

            await prisma.product.update({
                where: { id: product.id },
                data: { imageUrls: JSON.stringify([matchedUrl]) }
            });
            console.log(`✅ Matched ${product.name} -> ${matchedUrl}`);
        }
        
        // Also fix categories
        console.log('📦 Fixing Category URLs with extensions...');
        const categories = await prisma.category.findMany();
        for (const cat of categories) {
            let catUrl = cat.imageUrl;
            if (catUrl && !catUrl.endsWith('.jpg') && !catUrl.endsWith('.png') && !catUrl.endsWith('.jpeg')) {
                catUrl += '.jpg';
                await prisma.category.update({
                    where: { id: cat.id },
                    data: { imageUrl: catUrl }
                });
                console.log(`✅ Fixed category URL: ${cat.name}`);
            }
        }

        console.log('🎉 Intelligent Update (v2) complete!');
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

intelligentUpdate();
