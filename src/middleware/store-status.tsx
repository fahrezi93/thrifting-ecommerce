'use client'

import { useEffect } from 'react'
import { useStore } from '@/contexts/StoreContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'

interface StoreStatusProps {
  children: React.ReactNode
}

export function StoreStatusWrapper({ children }: StoreStatusProps) {
  const { settings, loading } = useStore()
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && settings) {
      // Skip maintenance mode for admin users
      if (settings.maintenanceMode && user?.role !== 'ADMIN') {
        // Allow home page during maintenance, but block shop/product pages
        const restrictedPaths = ['/shop', '/products', '/cart', '/checkout', '/profile']
        const isRestrictedPath = restrictedPaths.some(path => pathname.startsWith(path))
        
        if (isRestrictedPath) {
          router.push('/maintenance')
          return
        }
      }
      
      // Store closed affects everyone (including admin to see the status)
      if (!settings.isStoreActive) {
        router.push('/store-closed')
        return
      }
    }
  }, [settings, loading, router, user, pathname])

  // Show loading while checking store status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Only block rendering if store is completely inactive
  if (!settings?.isStoreActive) {
    return null
  }

  return <>{children}</>
}
