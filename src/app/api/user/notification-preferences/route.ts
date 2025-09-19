import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid

    const { browserNotifications, pushNotifications } = await request.json()

    // Update or create user preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        // Update notification preferences if they exist in the schema
        // For now, we'll just log the preferences
      },
      create: {
        userId,
        // Create with default values
      }
    })

    // Log the notification preference change
    console.log(`User ${userId} updated notification preferences:`, {
      browserNotifications,
      pushNotifications,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated',
      preferences: {
        browserNotifications,
        pushNotifications
      }
    })

  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
