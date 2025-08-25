import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingBag, Recycle, Heart, Star } from 'lucide-react'
import { CartSheet } from '@/components/cart/cart-sheet'
import AnimatedBackground from '@/components/ui/AnimatedBackground'

export default function HomePage() {
  const featuredProducts = [
    {
      id: '1',
      name: 'Vintage Denim Jacket',
      price: 150000,
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
      category: 'OUTERWEAR',
      size: 'M'
    },
    {
      id: '2',
      name: 'Floral Summer Dress',
      price: 120000,
      imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop',
      category: 'DRESSES',
      size: 'S'
    },
    {
      id: '3',
      name: 'Classic White Sneakers',
      price: 200000,
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
      category: 'SHOES',
      size: '42'
    },
    {
      id: '4',
      name: 'Leather Crossbody Bag',
      price: 180000,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      category: 'ACCESSORIES',
      size: 'One Size'
    }
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Animated CSS Background */}
          <AnimatedBackground />
          
          {/* Gradient Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/85 to-background/90"></div>
          
          <div className="container mx-auto px-4 relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2 space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  <Recycle className="h-4 w-4" />
                  Sustainable Fashion
                </div>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Sustainable Fashion
                  <span className="block text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Starts Here
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                  Discover unique, quality pre-loved clothing that tells a story. 
                  Shop consciously, dress beautifully, and make a positive impact on our planet.
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-6 py-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">1000+</div>
                    <div className="text-sm text-muted-foreground">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">5000+</div>
                    <div className="text-sm text-muted-foreground">Items Sold</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">95%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="text-lg group">
                    <Link href="/products">
                      <ShoppingBag className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      Shop Now
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="text-lg">
                    <Link href="/about">Learn More</Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative lg:col-span-1">
                {/* Decorative rings */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute -inset-2 border border-primary/20 rounded-full animate-spin-slow"></div>
                
                <div className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden bg-muted shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop"
                    alt="Thrift fashion collection"
                    width={400}
                    height={400}
                    priority
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Floating badges */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-primary shadow-lg">
                    ✨ Curated
                  </div>
                  <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-medium shadow-lg">
                    Eco-Friendly
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Thrift Haven?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're more than just a thrift store. We're a community committed to sustainable fashion.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Items</h2>
              <p className="text-lg text-muted-foreground">
                Handpicked treasures waiting for their new home
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Size {product.size}
                        </span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button asChild size="lg">
                <Link href="/products">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-2xl p-8 md:p-16 text-center text-primary-foreground">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Your Sustainable Fashion Journey?
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of conscious shoppers who have already discovered the joy of thrift fashion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/auth/signup">Create Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <Link href="/products" className="text-primary-foreground hover:text-primary">Browse Collection</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <CartSheet />
    </>
  )
}
