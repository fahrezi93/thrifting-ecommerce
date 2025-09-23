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

const mobileNavItems = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
  },
  {
    title: 'All Products',
    href: '/products',
    icon: ShoppingBag,
  },
  {
    title: 'Clothing',
    href: '/categories/clothing',
    icon: ShirtIcon,
    subItems: [
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
    icon: Briefcase,
    subItems: [
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
    icon: Footprints,
    subItems: [
      { title: 'Sneakers', href: '/categories/sneakers' },
      { title: 'Boots', href: '/categories/boots' },
      { title: 'Heels', href: '/categories/heels' },
      { title: 'Flats', href: '/categories/flats' },
      { title: 'Sandals', href: '/categories/sandals' },
      { title: 'Sports Shoes', href: '/categories/sports-shoes' },
    ]
  },
  {
    title: 'About Us',
    href: '/about',
    icon: Heart,
  },
  {
    title: 'Help Center',
    href: '/help-center',
    icon: HelpCircle,
  },
  {
    title: 'Contact',
    href: '/contact',
    icon: Phone,
  },
];

interface MobileNavigationProps {
  onClose: () => void;
}

export function MobileNavigation({ onClose }: MobileNavigationProps) {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return (
    <div className="space-y-2">
      {mobileNavItems.map((item, index) => (
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
