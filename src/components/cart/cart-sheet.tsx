'use client'

import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCart } from '@/store/cart'
import { Minus, Plus, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export function CartSheet() {
  const { user } = useAuth()
  const { items, isOpen, toggleCart, updateQuantity, removeItem, getTotalPrice } = useCart()
  

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent className="flex flex-col p-0 gap-0" side="right">
        <SheetHeader className="flex-shrink-0 p-6 pb-3">
          <SheetTitle>Shopping Cart ({items?.length || 0})</SheetTitle>
        </SheetHeader>

        {items && items.length > 0 ? (
          <>
            {/* Cart Items - Scrollable Area */}
            <div className="flex-1 overflow-y-auto py-2 min-h-0 px-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 border rounded-lg bg-white">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                      <p className="font-semibold text-sm">{formatPrice(item.price)}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Footer - Fixed at Bottom */}
            <div className="border-t pt-4 space-y-4 flex-shrink-0 px-6 pb-6">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg">{formatPrice(getTotalPrice())}</span>
              </div>
              
              {user ? (
                <Button className="w-full" asChild>
                  <Link href="/checkout" onClick={toggleCart}>
                    Proceed to Checkout
                  </Link>
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button className="w-full" asChild>
                    <Link href="/auth/signin" onClick={toggleCart}>
                      Sign In to Checkout
                    </Link>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    New customer?{' '}
                    <Link href="/auth/signup" className="underline" onClick={toggleCart}>
                      Create an account
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center py-8 px-6">
            <div className="text-center py-8">
              <div className="mb-6">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Discover amazing thrift finds and add them to your cart to get started!
              </p>
              <Button onClick={toggleCart} asChild className="w-full">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
