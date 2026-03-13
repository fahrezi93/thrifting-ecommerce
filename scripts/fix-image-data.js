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
        console.log('🧠 Starting Intelligent Database Update...');
        const products = await prisma.product.findMany();
        
        for (const product of products) {
            const name = product.name.toLowerCase();
            const brand = (product.brand || '').toLowerCase();
            let matchedUrl = null;

            if (name.includes('adidas') || brand.includes('adidas')) {
                matchedUrl = CLOUDINARY_BASE + assets.find(a => a.toLowerCase().includes('adidas'));
            } else if (name.includes('reebok') || brand.includes('reebok')) {
                matchedUrl = CLOUDINARY_BASE + assets.find(a => a.toLowerCase().includes('ree'));
            } else if (name.includes('uniqlo') || brand.includes('uniqlo')) {
                matchedUrl = CLOUDINARY_BASE + assets.find(a => a.toLowerCase().includes('85170606'));
            } else if (name.includes('carrier') || name.includes('cardigan')) {
                matchedUrl = CLOUDINARY_BASE + assets.find(a => a.toLowerCase().includes('carrier'));
            } else if (name.includes('training') || name.includes('pants')) {
                matchedUrl = CLOUDINARY_BASE + assets.find(a => a.toLowerCase().includes('football'));
            } else if (name.includes('polo')) {
                matchedUrl = CLOUDINARY_BASE + assets.find(a => a.toLowerCase().includes('product-1756'));
            }

            if (matchedUrl) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: { imageUrls: JSON.stringify([matchedUrl]) }
                });
                console.log(`✅ Matched ${product.name} -> ${matchedUrl}`);
            } else {
                // If no specific match, let's at least point to a generic Cloudinary asset if possible
                // or keep the placeholder but use a RELIABLE placeholder
                const betterPlaceholder = 'https://res.cloudinary.com/dsbdjzrin/image/upload/v1/thrift-haven/product-1756896092198';
                await prisma.product.update({
                    where: { id: product.id },
                    data: { imageUrls: JSON.stringify([betterPlaceholder]) }
                });
                console.log(`⚠️ Defaulted ${product.name} to generic Cloudinary asset`);
            }
        }
        console.log('🎉 Intelligent Update complete!');
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

intelligentUpdate();
