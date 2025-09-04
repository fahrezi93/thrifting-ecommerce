'use client'

import Link from 'next/link'
import { Github, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'
import { useStore } from '@/contexts/StoreContext'

export function Footer() {
  const { settings } = useStore()
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{settings?.storeName || 'Thrift Haven'}</h3>
            <p className="text-sm text-muted-foreground">
              {settings?.storeDescription || 'Sustainable fashion for the conscious shopper. Discover unique, quality pre-loved clothing.'}
            </p>
            <div className="flex space-x-4">
              <Link href="https://github.com/fahrezi93" className="text-muted-foreground hover:text-primary">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="https://instagram.com/moh.fahrezi" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="mailto:mohfahrezi93@gmail.com" className="text-muted-foreground hover:text-primary">
                <Mail className="h-5 w-5" />
              </Link>
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
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{settings?.storeEmail || 'hello@thrifthaven.com'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{settings?.storePhone || '+62 123 456 7890'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{settings?.storeAddress || 'Jakarta, Indonesia'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 {settings?.storeName || 'Thrift Haven'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
