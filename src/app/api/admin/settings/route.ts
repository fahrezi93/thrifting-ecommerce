import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/auth'

// Mock settings data - in a real app, this would be stored in database
let storeSettings = {
  storeName: 'Thrift Haven',
  storeDescription: 'Sustainable fashion for the conscious shopper. Discover unique, quality pre-loved clothing.',
  storeEmail: 'hello@thrifthaven.com',
  storePhone: '+62 123 456 7890',
  storeAddress: 'Jakarta, Indonesia',
  isStoreActive: true,
  allowRegistration: true,
  maintenanceMode: false,
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    return NextResponse.json(storeSettings)
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
    
    // Update settings
    storeSettings = { ...storeSettings, ...newSettings }
    
    return NextResponse.json(storeSettings)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
