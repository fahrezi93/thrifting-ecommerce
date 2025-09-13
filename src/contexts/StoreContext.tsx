'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { StoreSettings, fetchStoreSettings } from '@/lib/store-settings'

interface StoreContextType {
  settings: StoreSettings | null
  loading: boolean
  refreshSettings: () => Promise<void>
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshSettings = async () => {
    try {
      setLoading(true)
      const storeSettings = await fetchStoreSettings()
      setSettings(storeSettings)
    } catch (error) {
      console.error('Failed to fetch store settings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshSettings()
    
    // Only use SSE in development (localhost)
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Connect to Server-Sent Events for real-time updates across devices
      const eventSource = new EventSource('/api/store/status-updates')
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'STORE_STATUS_CHANGED') {
            console.log('Store status changed via SSE, refreshing settings...')
            refreshSettings()
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error)
        }
      }
      
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
      }
      
      return () => {
        eventSource.close()
      }
    }
  }, [])

  return (
    <StoreContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
