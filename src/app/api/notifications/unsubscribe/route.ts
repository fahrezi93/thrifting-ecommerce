import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json()
    
    // Remove subscription from database
    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint: endpoint
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing subscription:', error)
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    )
  }
}
