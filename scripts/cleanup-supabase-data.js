const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupSupabaseData() {
    try {
        console.log('🔍 Starting Supabase data cleanup...');

        // 1. Cleanup Products
        const products = await prisma.product.findMany({
            where: {
                imageUrls: {
                    contains: 'supabase.co'
                }
            }
        });

        console.log(`Found ${products.length} products with Supabase URLs.`);

        for (const product of products) {
            let imageUrls = JSON.parse(product.imageUrls);
            const updatedUrls = imageUrls.map(url => {
                if (url.includes('supabase.co')) {
                    // Replace with a placeholder or try to map to Cloudinary if we knew the mapping
                    // For now, let's use a placeholder to avoid next/image errors
                    return 'https://via.placeholder.com/800x800?text=Migrated+from+Supabase';
                }
                return url;
            });

            await prisma.product.update({
                where: { id: product.id },
                data: {
                    imageUrls: JSON.stringify(updatedUrls)
                }
            });
            console.log(`Updated product: ${product.name} (${product.id})`);
        }

        // 2. Cleanup Categories
        const categories = await prisma.category.findMany({
            where: {
                imageUrl: {
                    contains: 'supabase.co'
                }
            }
        });

        console.log(`Found ${categories.length} categories with Supabase URLs.`);

        for (const category of categories) {
            await prisma.category.update({
                where: { id: category.id },
                data: {
                    imageUrl: 'https://via.placeholder.com/800x800?text=Migrated+from+Supabase'
                }
            });
            console.log(`Updated category: ${category.name} (${category.id})`);
        }

        console.log('✅ Supabase data cleanup completed!');
    } catch (error) {
        console.error('💥 Cleanup failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupSupabaseData();
