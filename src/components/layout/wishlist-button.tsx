'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export function WishlistButton() {
  const { user } = useAuth()
  const [wishlistCount, setWishlistCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchWishlistCount()
    } else {
      setWishlistCount(0)
      setIsLoading(false)
    }
  }, [user])

  const fetchWishlistCount = async () => {
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
        setWishlistCount(data.length)
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <Link href="/wishlist">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
      >
        <Heart className="h-5 w-5" />
        {!isLoading && wishlistCount > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
            {wishlistCount}
          </span>
        )}
      </Button>
    </Link>
  )
}
