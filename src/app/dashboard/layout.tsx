'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, MapPin, ShoppingBag, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarItems = [
  {
    title: 'Profile',
    href: '/dashboard',
    icon: User,
  },
  {
    title: 'Addresses',
    href: '/dashboard/addresses',
    icon: MapPin,
  },
  {
    title: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingBag,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export default function DashboardLayout({
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
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-card rounded-lg border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Dashboard</h2>
              <p className="text-sm text-muted-foreground">Welcome back, {user.displayName || user.email}</p>
            </div>
            
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          {children}
        </div>
      </div>
    </div>
  )
}
