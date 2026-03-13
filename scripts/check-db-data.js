const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        const products = await prisma.product.findMany({
            take: 20
        });
        console.log('--- PRODUCTS ---');
        products.forEach(p => {
            console.log(`Product: ${p.name}`);
            console.log(`URLs: ${p.imageUrls}`);
            console.log('---');
        });

        const categories = await prisma.category.findMany();
        console.log('--- CATEGORIES ---');
        categories.forEach(c => {
            console.log(`Category: ${c.name}`);
            console.log(`URL: ${c.imageUrl}`);
            console.log('---');
        });
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
