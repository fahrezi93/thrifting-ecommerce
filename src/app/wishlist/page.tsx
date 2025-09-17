'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCart } from '@/store/cart'
import Image from 'next/image'

interface WishlistItem {
  id: string
  userId: string
  productId: string
  createdAt: string
  product: {
    id: string
    name: string
    description: string
    price: number
    imageUrls: string
    size: string
    condition: string
    brand?: string
    color?: string
    stock: number
    isActive: boolean
  }
}

export default function WishlistPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const { addItem } = useCart()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/auth/signin')
      return
    }
    
    fetchWishlist()
  }, [user, loading, router])

  const fetchWishlist = async () => {
    try {
      if (!user) return
      
      const token = await user.getIdToken?.()
      if (!token) return
      
      const response = await fetch('/api/user/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data)
      } else {
        console.error('Failed to fetch wishlist:', response.status)
        addToast({
          title: 'Error',
          description: 'Failed to load wishlist',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      addToast({
        title: 'Error',
        description: 'Network error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      if (!user) return
      
      setRemovingItems(prev => new Set(prev).add(productId))
      
      const token = await user.getIdToken?.()
      if (!token) return
      
      const response = await fetch(`/api/user/wishlist?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.product.id !== productId))
        addToast({
          title: 'Success!',
          description: 'Item removed from wishlist',
          variant: 'success'
        })
      } else {
        throw new Error('Failed to remove item')
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      addToast({
        title: 'Error',
        description: 'Failed to remove item from wishlist',
        variant: 'destructive'
      })
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleAddToCart = (product: WishlistItem['product']) => {
    if (product.stock <= 0) {
      addToast({
        title: 'Out of Stock',
        description: 'This item is currently out of stock',
        variant: 'destructive'
      })
      return
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: JSON.parse(product.imageUrls)[0] || '/placeholder-image.svg',
      size: product.size,
      stock: product.stock
    })

    addToast({
      title: 'Added to Cart!',
      description: `${product.name} has been added to your cart`,
      variant: 'success'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading wishlist...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Please sign in to view your wishlist</h2>
          <Button onClick={() => router.push('/auth/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">
              Start adding items you love to your wishlist
            </p>
            <Button onClick={() => router.push('/products')}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const images = JSON.parse(item.product.imageUrls)
              const isRemoving = removingItems.has(item.product.id)
              
              return (
                <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="aspect-square relative overflow-hidden rounded-t-lg">
                        <Image
                          src={images[0] || '/placeholder-image.svg'}
                          alt={item.product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {item.product.stock <= 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="destructive">Out of Stock</Badge>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                        onClick={() => removeFromWishlist(item.product.id)}
                        disabled={isRemoving}
                      >
                        {isRemoving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {item.product.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {item.product.brand && (
                          <Badge variant="outline">{item.product.brand}</Badge>
                        )}
                        <Badge variant="secondary">{item.product.size}</Badge>
                        <Badge variant="outline">{item.product.condition}</Badge>
                      </div>
                      
                      {item.product.color && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Color: {item.product.color}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(item.product.price)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Stock: {item.product.stock}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/products/${item.product.id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAddToCart(item.product)}
                          disabled={item.product.stock <= 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
