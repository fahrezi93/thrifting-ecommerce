'use client'

import { useEffect } from 'react'
import { useStore } from '@/contexts/StoreContext'
import { useRouter } from 'next/navigation'

interface StoreStatusProps {
  children: React.ReactNode
}

export function StoreStatusWrapper({ children }: StoreStatusProps) {
  const { settings, loading } = useStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && settings) {
      // If maintenance mode is enabled, redirect to maintenance page
      if (settings.maintenanceMode) {
        router.push('/maintenance')
        return
      }
      
      // If store is not active, redirect to store closed page
      if (!settings.isStoreActive) {
        router.push('/store-closed')
        return
      }
    }
  }, [settings, loading, router])

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

  // If maintenance mode or store inactive, don't render children
  if (settings?.maintenanceMode || !settings?.isStoreActive) {
    return null
  }

  return <>{children}</>
}
