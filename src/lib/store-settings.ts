import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface StoreSettings {
  id: string
  storeName: string
  storeDescription: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  isStoreActive: boolean
  allowRegistration: boolean
  maintenanceMode: boolean
  createdAt: Date
  updatedAt: Date
}

// Server-side function to get store settings
export async function getStoreSettings(): Promise<StoreSettings> {
  let settings = await prisma.storeSettings.findUnique({
    where: { id: 'store' }
  })
  
  if (!settings) {
    // Create default settings if they don't exist
    settings = await prisma.storeSettings.create({
      data: { id: 'store' }
    })
  }
  
  return settings
}

// Client-side function to fetch store settings
export async function fetchStoreSettings(): Promise<StoreSettings> {
  const response = await fetch('/api/store/settings', {
    cache: 'no-store', // Prevent caching to ensure fresh data
    headers: {
      'Cache-Control': 'no-cache'
    }
  })
  if (!response.ok) {
    throw new Error('Failed to fetch store settings')
  }
  return response.json()
}
