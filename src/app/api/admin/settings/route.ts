import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    
    // Get or create store settings
    let settings = await prisma.storeSettings.findUnique({
      where: { id: 'store' }
    })
    
    if (!settings) {
      // Create default settings if they don't exist
      settings = await prisma.storeSettings.create({
        data: { id: 'store' }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request)
    const newSettings = await request.json()
    
    // Update or create settings
    const settings = await prisma.storeSettings.upsert({
      where: { id: 'store' },
      update: {
        storeName: newSettings.storeName,
        storeDescription: newSettings.storeDescription,
        storeEmail: newSettings.storeEmail,
        storePhone: newSettings.storePhone,
        storeAddress: newSettings.storeAddress,
        isStoreActive: newSettings.isStoreActive,
        allowRegistration: newSettings.allowRegistration,
        maintenanceMode: newSettings.maintenanceMode,
      },
      create: {
        id: 'store',
        storeName: newSettings.storeName,
        storeDescription: newSettings.storeDescription,
        storeEmail: newSettings.storeEmail,
        storePhone: newSettings.storePhone,
        storeAddress: newSettings.storeAddress,
        isStoreActive: newSettings.isStoreActive,
        allowRegistration: newSettings.allowRegistration,
        maintenanceMode: newSettings.maintenanceMode,
      }
    })
    
    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
