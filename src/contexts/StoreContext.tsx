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
