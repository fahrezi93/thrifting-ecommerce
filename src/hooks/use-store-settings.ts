'use client'

import { useState, useEffect } from 'react'

interface StoreSettings {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  supportEmail: string
  businessHours: string
  isOpen: boolean
}

const defaultSettings: StoreSettings = {
  storeName: 'Thrift Haven',
  storeEmail: 'hello@thrifthaven.com',
  storePhone: '+62 123 456 7890',
  storeAddress: 'Jakarta, Indonesia',
  supportEmail: 'support@thrifthaven.com',
  businessHours: 'Mon-Sun, 9 AM - 9 PM',
  isOpen: true
}

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/store/settings')
        console.log('API Response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Fetched store settings:', data) // Debug log
          
          // Map the data correctly
          const mappedSettings = {
            storeName: data.storeName || defaultSettings.storeName,
            storeEmail: data.storeEmail || defaultSettings.storeEmail,
            storePhone: data.storePhone || defaultSettings.storePhone,
            storeAddress: data.storeAddress || defaultSettings.storeAddress,
            supportEmail: data.supportEmail || defaultSettings.supportEmail,
            businessHours: data.businessHours || defaultSettings.businessHours,
            isOpen: data.isStoreActive ?? defaultSettings.isOpen
          }
          
          console.log('Mapped settings:', mappedSettings)
          setSettings(mappedSettings)
        } else {
          console.log('API response not ok:', response.status)
          // Use default settings if API fails
          setSettings(defaultSettings)
        }
      } catch (err) {
        console.error('Failed to fetch store settings:', err)
        setError('Failed to load store settings')
        setSettings(defaultSettings)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings, loading, error }
}
