const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CLOUDINARY_BASE = 'https://res.cloudinary.com/dsbdjzrin/image/upload/v1/thrift-haven/';

// Generic but real assets from our 10 uploads
const categoryMap = {
    'shoes': CLOUDINARY_BASE + 'adidas_adidas_men_running_shoes_galaxy_7_sepatu_lari_pria_-id8757-_full06_n1jpnjvc',
    'men': CLOUDINARY_BASE + '01-ADIDAS-AFAV6ADI5-ADIIC7428-Black',
    'women': CLOUDINARY_BASE + '01-LILY-LFCCPLLY0-32130189-Grey_89217032-e08b-490c-9907-1f3b2309c7dd',
    'accessories': CLOUDINARY_BASE + 'product-1756896092198'
};

async function fixCategories() {
    try {
        console.log('📦 Updating Categories with Cloudinary assets...');
        const categories = await prisma.category.findMany();
        
        for (const cat of categories) {
            const key = cat.name.toLowerCase();
            if (categoryMap[key]) {
                await prisma.category.update({
                    where: { id: cat.id },
                    data: { imageUrl: categoryMap[key] }
                });
                console.log(`✅ Updated Category: ${cat.name}`);
            } else {
                // Default fallback to a valid Cloudinary asset
                await prisma.category.update({
                    where: { id: cat.id },
                    data: { imageUrl: categoryMap['accessories'] }
                });
                console.log(`⚠️ Defaulted Category: ${cat.name}`);
            }
        }
        console.log('🎉 Categories updated!');
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

fixCategories();
