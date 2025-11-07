import AnimatedProductCard from '@/components/ui/animated-product-card';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all categories
export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true }
    });
    
    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug }
  });

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} - Thrift Haven`,
    description: category.description || `Browse ${category.name} at Thrift Haven`,
  };
}

async function getCategoryBySlug(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { 
        slug: slug,
        isActive: true 
      },
    });
    return category;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

async function getProductsByCategory(slug: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        category: {
          slug: slug,
          isActive: true
        }
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate average rating for each product
    const productsWithRating = products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      reviewCount: product.reviews.length
    }));

    return productsWithRating;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);
  
  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(params.slug);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">{category.name}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {category.description || `Browse our collection of ${category.name.toLowerCase()}`}
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product: any, index: number) => (
            <AnimatedProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-2">No products yet</h2>
            <p className="text-muted-foreground">
              We're currently curating items for this category. Check back soon for new arrivals!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
