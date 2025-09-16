'use client'

import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingBag, Recycle, Heart, Star } from 'lucide-react'
import { MaintenanceBanner } from '@/components/maintenance-banner'
import { PushNotificationSetup } from '@/components/push-notification-setup'
import { useStore } from '@/contexts/StoreContext'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AnimatedProductCard from '@/components/ui/animated-product-card'
import ScrollReveal from '@/components/ui/scroll-reveal'
import HeroSlideshow from '@/components/ui/hero-slideshow'

interface Product {
  id: string
  name: string
  price: number
  imageUrls: string
  size: string
  category: {
    name: string
    slug: string
  }
}

export default function HomePage() {
  const { user } = useAuth()
  const { settings } = useStore()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/products/featured')
        if (response.ok) {
          const products = await response.json()
          setFeaturedProducts(products)
        }
      } catch (error) {
        console.error('Error fetching featured products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  return (
    <>
      <Head>
        <link
          rel="preload"
          as="image"
          href="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=75"
          imageSizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
        />
        <link
          rel="preload"
          as="image"
          href="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=75"
        />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      </Head>
      <MaintenanceBanner />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Animated CSS Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5"></div>
          
          {/* Gradient Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/85 to-background/90"></div>
          
          <div className="container mx-auto px-4 relative z-20">
            {/* Push Notification Setup */}
            {user && <PushNotificationSetup />}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <motion.div 
                className="lg:col-span-2 space-y-6"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div 
                  className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  <Recycle className="h-4 w-4" />
                  Sustainable Fashion
                </motion.div>
                <motion.h1 
                  className="text-4xl md:text-6xl font-bold leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  Sustainable Fashion
                  <span className="block text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Starts Here
                  </span>
                </motion.h1>
                <motion.p 
                  className="text-lg md:text-xl text-muted-foreground max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Discover unique, quality pre-loved clothing that tells a story. 
                  Shop consciously, dress beautifully, and make a positive impact on our planet.
                </motion.p>
                
                {/* Stats */}
                <motion.div 
                  className="flex flex-wrap gap-6 py-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <div className="text-2xl font-bold text-primary">1000+</div>
                    <div className="text-sm text-muted-foreground">Happy Customers</div>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <div className="text-2xl font-bold text-primary">5000+</div>
                    <div className="text-sm text-muted-foreground">Items Sold</div>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <div className="text-2xl font-bold text-primary">95%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button asChild size="lg" className="text-lg group">
                      <Link href="/products">
                        <ShoppingBag className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                        Shop Now
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" size="lg" asChild className="text-lg">
                      <Link href="/about">Learn More</Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="relative lg:col-span-1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                {/* Decorative rings - simplified */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-2xl"></div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <HeroSlideshow />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0.1}>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose {settings?.storeName || 'Thrift Haven'}?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {settings?.storeDescription || "We're more than just a thrift store. We're a community committed to sustainable fashion."}
                </p>
              </div>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ScrollReveal direction="up" delay={0.1}>
                <Card className="text-center p-6">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Recycle className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Sustainable</h3>
                    <p className="text-muted-foreground">
                      Give clothes a second life and reduce fashion waste. Every purchase makes a difference.
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>
              
              <ScrollReveal direction="up" delay={0.2}>
                <Card className="text-center p-6">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Heart className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Curated Quality</h3>
                    <p className="text-muted-foreground">
                      Each item is carefully selected and inspected to ensure you get the best quality pieces.
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>
              
              <ScrollReveal direction="up" delay={0.3}>
                <Card className="text-center p-6">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Star className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Unique Finds</h3>
                    <p className="text-muted-foreground">
                      Discover one-of-a-kind pieces that you won't find anywhere else. Express your unique style.
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0.1}>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Items</h2>
                <p className="text-lg text-muted-foreground">
                  Handpicked treasures waiting for their new home
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={0.2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <div className="aspect-square bg-muted rounded-t-lg"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-4 bg-muted rounded w-20"></div>
                          <div className="h-4 bg-muted rounded w-16"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : featuredProducts.length > 0 ? (
                  featuredProducts.map((product, index) => (
                    <AnimatedProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No featured products available at the moment.</p>
                  </div>
                )}
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={0.3}>
              <div className="text-center mt-12">
                <Button asChild size="lg">
                  <Link href="/products">View All Products</Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0.1}>
              <div className="bg-primary rounded-2xl p-8 md:p-16 text-center text-primary-foreground">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Start Your Sustainable Fashion Journey?
                </h2>
                <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                  Join thousands of conscious shoppers who have already discovered the joy of thrift fashion.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!user && (
                    <Button size="lg" variant="secondary" asChild>
                      <Link href="/auth/signup">Create Account</Link>
                    </Button>
                  )}
                  <Button size="lg" variant="outline" asChild className="border-primary-foreground hover:bg-primary-foreground">
                    <Link href="/products" className="text-black hover:text-primary">Browse Collection</Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
      
    </>
  )
}
