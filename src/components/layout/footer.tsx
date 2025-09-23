'use client'

import Link from 'next/link'
import { Github, Instagram, Mail, Phone, MapPin, Clock, CreditCard } from 'lucide-react'
import { useStore } from '@/contexts/StoreContext'
import { motion } from 'framer-motion'
import { ThemeToggleButton } from '@/components/ui/theme-toggle'

export function Footer() {
  const { settings } = useStore()

  return (
    <footer className="bg-muted/50 border-t" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{settings?.storeName || 'Thrift Haven'}</h3>
            <p className="text-sm text-muted-foreground">
              {settings?.storeDescription || 'Sustainable fashion for the conscious shopper. Discover unique, quality pre-loved clothing.'}
            </p>
            <div className="flex space-x-4" role="list" aria-label="Social media links">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="https://github.com/fahrezi93" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Visit our GitHub page"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="https://instagram.com/moh.fahrezi" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Visit our Instagram page"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="mailto:mohfahrezi93@gmail.com" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Send us an email"
                >
                  <Mail className="h-5 w-5" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/products" className="block text-sm text-muted-foreground hover:text-primary">
                Shop All
              </Link>
              <Link href="/categories" className="block text-sm text-muted-foreground hover:text-primary">
                Categories
              </Link>
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-primary">
                About Us
              </Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-primary">
                Contact
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold">Customer Service</h4>
            <div className="space-y-2">
              <Link href="/help-center" className="block text-sm text-muted-foreground hover:text-primary">
                Help Center
              </Link>
              <Link href="/shipping-info" className="block text-sm text-muted-foreground hover:text-primary">
                Shipping Info
              </Link>
              <Link href="/returns" className="block text-sm text-muted-foreground hover:text-primary">
                Returns
              </Link>
              <Link href="/size-guide" className="block text-sm text-muted-foreground hover:text-primary">
                Size Guide
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a 
                  href={`mailto:${settings?.storeEmail || 'hello@thrifthaven.com'}`}
                  className="hover:text-primary transition-colors"
                >
                  {settings?.storeEmail || 'hello@thrifthaven.com'}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a 
                  href={`tel:${settings?.storePhone || '+62 123 456 7890'}`}
                  className="hover:text-primary transition-colors"
                >
                  {settings?.storePhone || '+62 123 456 7890'}
                </a>
              </div>
              <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{settings?.storeAddress || 'Jakarta, Indonesia'}</span>
              </div>
              
              {/* Business Hours */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>Mon-Sun, 9 AM - 9 PM</span>
              </div>
              
              {/* Payment Methods */}
              <div className="pt-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-medium">We Accept</span>
                </div>
                <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                  <span className="bg-muted px-2 py-1 rounded">DOKU</span>
                  <span className="bg-muted px-2 py-1 rounded">Bank Transfer</span>
                  <span className="bg-muted px-2 py-1 rounded">E-Wallet</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8">
          {/* Theme Toggle - Above Copyright, Left Aligned */}
          <div className="flex justify-start items-center mb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <ThemeToggleButton 
                variant="circle-blur" 
                start="center"
                className="shadow-sm hover:shadow-md transition-shadow duration-200"
              />
            </motion.div>
          </div>
          
          {/* Copyright and Links */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 {settings?.storeName || 'Thrift Haven'}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
          
          {/* SEO Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": settings?.storeName || "Thrift Haven",
                "description": settings?.storeDescription || "Sustainable fashion for the conscious shopper",
                "url": typeof window !== 'undefined' ? window.location.origin : '',
                "logo": typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '',
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": settings?.storePhone || "+62 123 456 7890",
                  "contactType": "customer service",
                  "email": settings?.storeEmail || "hello@thrifthaven.com"
                },
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": settings?.storeAddress || "Jakarta, Indonesia"
                },
                "sameAs": [
                  "https://github.com/fahrezi93",
                  "https://instagram.com/moh.fahrezi"
                ]
              })
            }}
          />
        </div>
      </div>
    </footer>
  )
}
