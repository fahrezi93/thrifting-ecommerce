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

const categories = [
  {
    title: 'Clothing',
    href: '/categories/clothing',
    description: 'Quality thrift clothing collection',
    icon: ShirtIcon,
    items: [
      { title: 'T-Shirts', href: '/categories/t-shirts' },
      { title: 'Shirts', href: '/categories/shirts' },
      { title: 'Hoodies & Sweaters', href: '/categories/hoodies' },
      { title: 'Jackets', href: '/categories/jackets' },
      { title: 'Dresses', href: '/categories/dresses' },
      { title: 'Blouses', href: '/categories/blouses' },
    ]
  },
  {
    title: 'Pants',
    href: '/categories/pants',
    description: 'Various types of thrift pants selection',
    icon: Briefcase,
    items: [
      { title: 'Jeans', href: '/categories/jeans' },
      { title: 'Long Pants', href: '/categories/long-pants' },
      { title: 'Shorts', href: '/categories/shorts' },
      { title: 'Cargo Pants', href: '/categories/cargo-pants' },
      { title: 'Wide Pants', href: '/categories/wide-pants' },
      { title: 'Skirts', href: '/categories/skirts' },
    ]
  },
  {
    title: 'Shoes',
    href: '/categories/shoes',
    description: 'Thrift shoes in best condition',
    icon: Footprints,
    items: [
      { title: 'Sneakers', href: '/categories/sneakers' },
      { title: 'Boots', href: '/categories/boots' },
      { title: 'Heels', href: '/categories/heels' },
      { title: 'Flats', href: '/categories/flats' },
      { title: 'Sandals', href: '/categories/sandals' },
      { title: 'Sports Shoes', href: '/categories/sports-shoes' },
    ]
  }
];

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

export function MainNavigation() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* Shop Categories */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Shop</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 md:w-[500px] lg:w-[600px] lg:grid-cols-2">
              <div className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/products"
                  >
                    <ShirtIcon className="h-6 w-6" />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      All Products
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Browse our complete collection of sustainable fashion pieces
                    </p>
                  </Link>
                </NavigationMenuLink>
              </div>
              {categories.map((category) => (
                <ListItem
                  key={category.title}
                  title={category.title}
                  href={category.href}
                  icon={category.icon}
                >
                  {category.description}
                </ListItem>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Categories with Subcategories */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 md:w-[600px] lg:w-[800px] lg:grid-cols-3">
              {categories.map((category) => (
                <div key={category.title} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <category.icon className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-medium leading-none">{category.title}</h4>
                  </div>
                  <div className="grid gap-1">
                    {category.items.map((item) => (
                      <NavigationMenuLink key={item.title} asChild>
                        <Link
                          href={item.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{item.title}</div>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </div>
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
          'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          <div className="text-sm font-medium leading-none">{title}</div>
        </div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </Link>
    </NavigationMenuLink>
  );
});
ListItem.displayName = 'ListItem';
