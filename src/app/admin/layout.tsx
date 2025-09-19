'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, ShoppingCart, Users, BarChart3, Settings, Bell, MessageSquare, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ContactNotificationListener } from '@/components/admin/contact-notification-listener'
import { ContactMessageBadge } from '@/components/admin/contact-message-badge'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: Package,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Reviews',
    href: '/admin/reviews',
    icon: Star,
  },
  {
    title: 'Contact Messages',
    href: '/admin/contact-messages',
    icon: MessageSquare,
  },
  {
    title: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/auth/signin')
      return
    }
    
    // Check admin role
    checkAdminRole()
  }, [user, loading, router])

  const checkAdminRole = async () => {
    try {
      if (!user) return
      
      const token = await user.getIdToken?.()
      if (!token) return
      const response = await fetch('/api/auth/check-role', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        router.push('/')
        return
      }
      
      const { role } = await response.json()
      if (role !== 'ADMIN') {
        router.push('/')
        return
      }
    } catch (error) {
      console.error('Error checking admin role:', error)
      router.push('/')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="md:hidden bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage your store</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:grid md:grid-cols-4 gap-4 md:gap-8">
          {/* Mobile Sidebar - Horizontal scroll */}
          <div className="md:col-span-1 md:sticky md:top-4 md:h-fit">
            <div className="bg-card rounded-lg border p-3 md:p-6">
              {/* Desktop Header */}
              <div className="hidden md:block mb-6">
                <h2 className="text-lg font-semibold">Admin Panel</h2>
                <p className="text-sm text-muted-foreground">Manage your store</p>
              </div>
              
              {/* Mobile: Horizontal scroll navigation */}
              <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center space-x-2 md:space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap min-w-fit',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline md:inline">{item.title}</span>
                      {item.href === '/admin/contact-messages' && <ContactMessageBadge />}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 min-w-0">
            {children}
          </div>
        </div>
      </div>

      {/* Notification Components */}
      <ContactNotificationListener />
    </div>
  )
}
