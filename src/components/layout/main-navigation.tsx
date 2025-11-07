'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { 
  ShirtIcon, 
  Glasses, 
  Watch, 
  Footprints, 
  Briefcase, 
  Sparkles,
  Heart,
  Info,
  HelpCircle,
  Phone,
  Truck,
  RotateCcw,
  Ruler,
  Star
} from 'lucide-react';


const aboutLinks = [
  {
    title: 'Our Story',
    href: '/about',
    description: 'Learn about our sustainable fashion mission',
    icon: Heart,
  },
  {
    title: 'How It Works',
    href: '/about/how-it-works',
    description: 'Discover our thrifting process',
    icon: Info,
  },
  {
    title: 'Sustainability',
    href: '/about/sustainability',
    description: 'Our commitment to the environment',
    icon: Sparkles,
  },
  {
    title: 'Quality Promise',
    href: '/about/quality',
    description: 'How we ensure item quality',
    icon: Star,
  }
];

const supportLinks = [
  {
    title: 'Help Center',
    href: '/help-center',
    description: 'Find answers to common questions',
    icon: HelpCircle,
  },
  {
    title: 'Contact Us',
    href: '/contact',
    description: 'Get in touch with our team',
    icon: Phone,
  },
  {
    title: 'Shipping Info',
    href: '/shipping-info',
    description: 'Delivery options and timing',
    icon: Truck,
  },
  {
    title: 'Returns',
    href: '/returns',
    description: 'Easy return and exchange policy',
    icon: RotateCcw,
  },
  {
    title: 'Size Guide',
    href: '/size-guide',
    description: 'Find your perfect fit',
    icon: Ruler,
  }
];

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

// Helper to get an icon for a category
const getCategoryIcon = (categoryName: string) => {
  const lowerCaseName = categoryName.toLowerCase();
  if (lowerCaseName.includes('clothing') || lowerCaseName.includes('tops')) return ShirtIcon;
  if (lowerCaseName.includes('pants') || lowerCaseName.includes('bottoms')) return Briefcase;
  if (lowerCaseName.includes('shoe')) return Footprints;
  if (lowerCaseName.includes('accessory')) return Glasses;
  if (lowerCaseName.includes('watch')) return Watch;
  return Sparkles; // Default icon
};

export function MainNavigation() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [featuredImages, setFeaturedImages] = React.useState<string[]>(['/placeholder-image.jpg']);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    const fetchFeaturedImages = async () => {
      try {
        const response = await fetch('/api/products?sortBy=newest');
        if (response.ok) {
          const products = await response.json();
          const images: string[] = [];
          
          products.slice(0, 10).forEach((product: any) => {
            if (product.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
              images.push(product.imageUrls[0]);
            }
          });

          if (images.length > 0) {
            setFeaturedImages(images);
          }
        }
      } catch (error) {
        console.error('Failed to fetch featured images:', error);
      }
    };

    fetchCategories();
    fetchFeaturedImages();
  }, []);

  // Rotate featured images every 2 seconds with random selection
  React.useEffect(() => {
    if (featuredImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * featuredImages.length);
        } while (newIndex === prev && featuredImages.length > 1);
        return newIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [featuredImages.length]);
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* Shop - Focus on Products */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Shop</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 md:w-[400px] lg:w-[450px] lg:grid-cols-2">
              <div className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="relative flex h-full w-full select-none flex-col justify-end rounded-md overflow-hidden p-4 no-underline outline-none focus:shadow-md group"
                    href="/products"
                  >
                    {featuredImages.map((image, idx) => (
                      <div 
                        key={idx}
                        className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-105"
                        style={{ 
                          backgroundImage: `url(${image})`,
                          opacity: idx === currentImageIndex ? 1 : 0
                        }}
                      />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
                    <div className="relative z-10">
                      <ShirtIcon className="h-5 w-5 text-white" />
                      <div className="mb-1 mt-3 text-base font-medium text-white">
                        All Products
                      </div>
                      <p className="text-xs leading-tight text-white/90">
                        Browse our complete collection
                      </p>
                    </div>
                  </Link>
                </NavigationMenuLink>
              </div>
              <ListItem
                title="Newest First"
                href="/products?sortBy=newest"
                icon={Sparkles}
              >
                Latest additions to our sustainable fashion collection
              </ListItem>
              <ListItem
                title="Price: Low to High"
                href="/products?sortBy=price-low"
                icon={Heart}
              >
                Great value for money with amazing prices
              </ListItem>
              <ListItem
                title="Price: High to Low"
                href="/products?sortBy=price-high"
                icon={Star}
              >
                Premium quality items sorted by price
              </ListItem>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Categories */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 md:w-[400px] lg:w-[450px] lg:grid-cols-2">
              <div className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="relative flex h-full w-full select-none flex-col justify-end rounded-md overflow-hidden p-4 no-underline outline-none focus:shadow-md group"
                    href="/categories"
                  >
                    {featuredImages.map((image, idx) => (
                      <div 
                        key={idx}
                        className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-105"
                        style={{ 
                          backgroundImage: `url(${image})`,
                          opacity: idx === currentImageIndex ? 1 : 0
                        }}
                      />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
                    <div className="relative z-10">
                      <Sparkles className="h-5 w-5 text-white" />
                      <div className="mb-1 mt-3 text-base font-medium text-white">
                        All Categories
                      </div>
                      <p className="text-xs leading-tight text-white/90">
                        Explore all categories
                      </p>
                    </div>
                  </Link>
                </NavigationMenuLink>
              </div>
              {categories.map((category) => (
                <ListItem
                  key={category.id}
                  title={category.name}
                  href={`/categories/${category.slug}`}
                  icon={getCategoryIcon(category.name)}
                >
                  {category.description || `Browse ${category.name.toLowerCase()}`}
                </ListItem>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* About */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>About</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
              {aboutLinks.map((link) => (
                <ListItem
                  key={link.title}
                  title={link.title}
                  href={link.href}
                  icon={link.icon}
                >
                  {link.description}
                </ListItem>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Support */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Support</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
              {supportLinks.map((link) => (
                <ListItem
                  key={link.title}
                  title={link.title}
                  href={link.href}
                  icon={link.icon}
                >
                  {link.description}
                </ListItem>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Direct Links */}
        <NavigationMenuItem>
          <Link href="/wishlist" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Wishlist
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link> & {
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
  }
>(({ className, title, children, icon: Icon, href, ...props }, ref) => {
  return (
    <NavigationMenuLink asChild>
      <Link
        ref={ref}
        href={href}
        className={cn(
          'block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
          <div className="text-xs font-medium leading-none">{title}</div>
        </div>
        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
          {children}
        </p>
      </Link>
    </NavigationMenuLink>
  );
});
ListItem.displayName = 'ListItem';
