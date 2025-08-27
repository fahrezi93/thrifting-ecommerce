'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/store/cart'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Heart, Share2, ShoppingCart, Check } from 'lucide-react'
import Link from 'next/link'
import { CartSheet } from '@/components/cart/cart-sheet'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrls: string[]
  category: string
  size: string
  condition: string
  brand?: string
  color?: string
  stock: number
}

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const { addItem } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check if item is saved on component mount
  useEffect(() => {
    const checkIsSaved = async () => {
      if (user && product) {
        try {
          const token = await user.getIdToken()
          const response = await fetch('/api/user/wishlist', {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (response.ok) {
            const wishlist = await response.json()
            const isItemSaved = wishlist.some((item: any) => item.productId === product.id)
            setIsSaved(isItemSaved)
          }
        } catch (error) {
          console.error('Error fetching wishlist:', error)
        }
      }
    }
    checkIsSaved()
  }, [product, user])

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrls[0],
        size: product.size,
        stock: product.stock,
      })
      toast({
        title: 'Added to Cart!',
        description: `${product.name} has been added to your cart.`,
        variant: 'success'
      })
    }
  }

  const handleSaveForLater = async () => {
    if (!product || !user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to save items to your wishlist.',
        variant: 'destructive'
      })
      return
    }

    try {
      const token = await user.getIdToken()
      if (isSaved) {
        // Remove from saved items
        const response = await fetch(`/api/user/wishlist?productId=${product.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          setIsSaved(false)
          toast({
            title: 'Removed from Wishlist',
            description: `${product.name} has been removed from your wishlist.`,
          })
        } else {
            throw new Error('Failed to remove from wishlist')
        }
      } else {
        // Add to saved items
        const response = await fetch('/api/user/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product.id }),
        })

        if (response.ok) {
          setIsSaved(true)
          toast({
            title: 'Saved to Wishlist!',
            description: `${product.name} has been added to your wishlist.`,
            variant: 'success'
          })
        } else {
            throw new Error('Failed to add to wishlist')
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border">
              <Image
                src={product.imageUrls[selectedImageIndex]}
                alt={product.name}
                width={600}
                height={600}
                className="object-cover w-full h-full"
              />
            </div>
            
            {product.imageUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded-md border-2 ${
                      selectedImageIndex === index ? 'border-primary' : 'border-muted'
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${product.name} ${index + 1}`}
                      width={150}
                      height={150}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                {product.brand && (
                  <Badge variant="outline">{product.brand}</Badge>
                )}
                <Badge variant="outline">{product.category}</Badge>
                <Badge variant="outline">{product.condition}</Badge>
              </div>
              <div className="text-3xl font-bold text-primary mb-4">
                {formatPrice(product.price)}
              </div>
            </div>

            <Separator />

            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <span className="ml-2 font-medium">{product.size}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Condition:</span>
                    <span className="ml-2 font-medium">{product.condition}</span>
                  </div>
                  {product.color && (
                    <div>
                      <span className="text-muted-foreground">Color:</span>
                      <span className="ml-2 font-medium">{product.color}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Stock:</span>
                    <span className="ml-2 font-medium">{product.stock} available</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleSaveForLater}
                >
                  {isSaved ? (
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                  ) : (
                    <Heart className="mr-2 h-4 w-4" />
                  )}
                  {isSaved ? 'Saved' : 'Save for Later'}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Shipping Info */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Shipping Information</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Free shipping on orders over Rp 500,000</p>
                  <p>• Standard delivery: 3-5 business days</p>
                  <p>• Express delivery: 1-2 business days</p>
                  <p>• 30-day return policy</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <CartSheet />
    </>
  )
}
