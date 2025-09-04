'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Search, User, Menu, X, Settings, LogOut, UserCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/store/cart'
import { useRouter } from 'next/navigation'
import { ClientOnly } from '@/components/client-only'
import { apiClient } from '@/lib/api-client'
import { useStore } from '@/contexts/StoreContext'

// Component to check and display admin menu
function AdminMenuCheck({ user, isMobile = false, onClose }: { user: any, isMobile?: boolean, onClose?: () => void }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        const { role } = await apiClient.get('/api/auth/check-role')
        setIsAdmin(role === 'ADMIN')
      } catch (error) {
        console.error('Error checking admin role:', error)
        // Fallback: check if user email is admin
        if (user.email === 'admin@admin.com') {
          setIsAdmin(true)
        }
      } finally {
        setLoading(false)
      }
    }

    checkAdminRole()
  }, [user])

  if (loading) return null
  if (!isAdmin) return null

  if (isMobile) {
    return (
      <Link
        href="/admin"
        className="block py-2 text-sm font-medium hover:text-primary transition-colors"
        onClick={onClose}
      >
        <Shield className="inline mr-2 h-4 w-4" />
        Admin Panel
      </Link>
    )
  }

  return (
    <DropdownMenuItem asChild>
      <Link href="/admin" className="cursor-pointer">
        <Shield className="mr-2 h-4 w-4" />
        <span>Admin Panel</span>
      </Link>
    </DropdownMenuItem>
  )
}

export function Navbar() {
  const { user, logout } = useAuth()
  const { getTotalItems, toggleCart } = useCart()
  const { settings } = useStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">
              {settings?.storeName || 'Thrift Haven'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
              Shop
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
              Categories
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <ClientOnly fallback={
              <Button
                variant="ghost"
                size="icon"
                className="relative z-50"
                disabled
              >
                <ShoppingBag className="h-5 w-5" />
              </Button>
            }>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCart}
                className="relative z-50"
                type="button"
              >
                <ShoppingBag className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
            </ClientOnly>

            {/* User Menu */}
            <ClientOnly fallback={
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" className="text-sm" disabled>
                  Loading...
                </Button>
              </div>
            }>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={''} alt={user.name || user.email || ''} />
                        <AvatarFallback>
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <AdminMenuCheck user={user} />
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => logout()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/auth/signin">
                    <Button variant="ghost" className="text-sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="text-sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </ClientOnly>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <Link
                  href="/products"
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link
                  href="/categories"
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link
                  href="/about"
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
              </div>

              {/* Mobile Auth - Only show Sign In/Sign Up for non-authenticated users */}
              <ClientOnly fallback={
                <div className="space-y-2 pt-4 border-t">
                  <div className="py-2 text-sm text-muted-foreground">Loading...</div>
                </div>
              }>
                {!user && (
                  <div className="space-y-2 pt-4 border-t">
                    <Link
                      href="/auth/signin"
                      className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </ClientOnly>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
