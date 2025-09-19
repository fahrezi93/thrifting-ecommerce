import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get store settings (public endpoint)
    let settings = await prisma.storeSettings.findUnique({
      where: { id: 'store' }
    })
    
    if (!settings) {
      // Create default settings if they don't exist
      settings = await prisma.storeSettings.create({
        data: { id: 'store' }
      })
    }
    
    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching store settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
