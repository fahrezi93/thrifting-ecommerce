'use client'

import React from 'react'
import { useCart } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Minus, Plus, X, ShoppingBag, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function CartPage() {
  const { user } = useAuth()
  const { items, updateQuantity, removeItem, getTotalPrice } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link 
            href="/products" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3 md:mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            {items?.length || 0} {items?.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {items && items.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="p-3 md:p-6">
                  <div className="flex gap-3 md:gap-6">
                    {/* Product Image */}
                    <div className="relative h-20 w-20 md:h-32 md:w-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={item.imageUrl || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.png';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="font-semibold text-sm md:text-lg mb-0.5 md:mb-1 line-clamp-2">{item.name}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground">Size: {item.size}</p>
                          {item.stock < 5 && (
                            <p className="text-xs md:text-sm text-orange-600 dark:text-orange-400 mt-0.5 md:mt-1">
                              Only {item.stock} left in stock
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mt-3 md:mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 md:gap-3">
                          <span className="text-xs md:text-sm text-muted-foreground">Quantity:</span>
                          <div className="flex items-center gap-1 md:gap-2 border rounded-lg p-0.5 md:p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 md:h-8 md:w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                            <span className="w-8 md:w-12 text-center text-sm md:text-base font-medium">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 md:h-8 md:w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-left md:text-right">
                          <p className="text-base md:text-xl font-bold">{formatPrice(item.price * item.quantity)}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-4 md:p-6 lg:sticky lg:top-24">
                <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Order Summary</h2>
                
                <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                  <div className="border-t pt-2 md:pt-3 mt-2 md:mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-base md:text-lg">Total</span>
                      <span className="font-bold text-xl md:text-2xl">{formatPrice(getTotalPrice())}</span>
                    </div>
                  </div>
                </div>

                {user ? (
                  <Button className="w-full h-11 md:h-12 text-sm md:text-base" asChild>
                    <Link href="/checkout">
                      Proceed to Checkout
                    </Link>
                  </Button>
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    <Button className="w-full h-11 md:h-12 text-sm md:text-base" asChild>
                      <Link href="/auth/signin">
                        Sign In to Checkout
                      </Link>
                    </Button>
                    <p className="text-xs md:text-sm text-center text-muted-foreground">
                      New customer?{' '}
                      <Link href="/auth/signup" className="font-medium underline hover:text-foreground">
                        Create an account
                      </Link>
                    </p>
                  </div>
                )}

                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t">
                  <h3 className="font-semibold mb-2 md:mb-3 text-xs md:text-sm">We Accept</h3>
                  <div className="flex gap-1.5 md:gap-2 flex-wrap">
                    <div className="px-2 md:px-3 py-1.5 md:py-2 border rounded text-xs font-medium">VISA</div>
                    <div className="px-2 md:px-3 py-1.5 md:py-2 border rounded text-xs font-medium">Mastercard</div>
                    <div className="px-2 md:px-3 py-1.5 md:py-2 border rounded text-xs font-medium">GoPay</div>
                    <div className="px-2 md:px-3 py-1.5 md:py-2 border rounded text-xs font-medium">OVO</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <Card className="p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6 flex justify-center">
                <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">
                Discover amazing thrift finds and add them to your cart to get started!
              </p>
              <Button size="lg" asChild>
                <Link href="/products">
                  Start Shopping
                </Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
