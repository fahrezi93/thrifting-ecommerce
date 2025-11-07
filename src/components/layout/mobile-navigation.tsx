'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShirtIcon, 
  Glasses, 
  Footprints, 
  Sparkles,
  Heart,
  Info,
  HelpCircle,
  Phone,
  ChevronRight,
  Home,
  ShoppingBag,
  Briefcase
} from 'lucide-react';


interface Category {
  id: string;
  name: string;
  slug: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: { title: string; href: string }[];
}

// Helper to get an icon for a category
const getCategoryIcon = (categoryName: string) => {
  const lowerCaseName = categoryName.toLowerCase();
  if (lowerCaseName.includes('clothing') || lowerCaseName.includes('tops')) return ShirtIcon;
  if (lowerCaseName.includes('pants') || lowerCaseName.includes('bottoms')) return Briefcase;
  if (lowerCaseName.includes('shoe')) return Footprints;
  if (lowerCaseName.includes('accessory')) return Glasses;
  return Sparkles; // Default icon
};


interface MobileNavigationProps {
  onClose: () => void;
}

export function MobileNavigation({ onClose }: MobileNavigationProps) {
  const [navItems, setNavItems] = React.useState<NavItem[]>([]);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  React.useEffect(() => {
    const staticItems: NavItem[] = [
      { title: 'Home', href: '/', icon: Home },
      { title: 'All Products', href: '/products', icon: ShoppingBag },
    ];

    const fetchCategoriesAndBuildNav = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const categories: Category[] = await response.json();
          const categoryItems: NavItem[] = categories.map(category => ({
            title: category.name,
            href: `/categories/${category.slug}`,
            icon: getCategoryIcon(category.name),
          }));

          const finalStaticItems: NavItem[] = [
            { title: 'About Us', href: '/about', icon: Heart },
            { title: 'Help Center', href: '/help-center', icon: HelpCircle },
            { title: 'Contact', href: '/contact', icon: Phone },
          ];

          setNavItems([...staticItems, ...categoryItems, ...finalStaticItems]);
        }
      } catch (error) {
        console.error('Failed to fetch categories for mobile nav:', error);
        // Set default items on error
        setNavItems([
          ...staticItems,
          { title: 'About Us', href: '/about', icon: Heart },
          { title: 'Help Center', href: '/help-center', icon: HelpCircle },
          { title: 'Contact', href: '/contact', icon: Phone },
        ]);
      }
    };

    fetchCategoriesAndBuildNav();
  }, []);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return (
    <div className="space-y-2">
      {navItems.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + (index * 0.05), duration: 0.3 }}
        >
          {item.subItems ? (
            // Expandable item with subitems
            <div>
              <button
                onClick={() => toggleExpanded(item.title)}
                className="flex items-center justify-between w-full py-3 text-sm font-medium hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
                <motion.div
                  animate={{ rotate: expandedItems.includes(item.title) ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.div>
              </button>
              
              {/* Subitems */}
              <motion.div
                initial={false}
                animate={{
                  height: expandedItems.includes(item.title) ? 'auto' : 0,
                  opacity: expandedItems.includes(item.title) ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pl-7 space-y-2 pb-2">
                  <Link
                    href={item.href}
                    className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={onClose}
                  >
                    View All {item.title}
                  </Link>
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.title}
                      href={subItem.href}
                      className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      onClick={onClose}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            // Simple link item
            <Link
              href={item.href}
              className="flex items-center gap-3 py-3 text-sm font-medium hover:text-primary transition-colors"
              onClick={onClose}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          )}
        </motion.div>
      ))}
    </div>
  );
}
