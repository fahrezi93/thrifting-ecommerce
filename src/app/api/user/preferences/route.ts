import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyIdToken } from '@/lib/firebase-admin'

// GET - Fetch user preferences
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decodedToken = await verifyIdToken(token)
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user preferences, create default if doesn't exist
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: decodedToken.uid }
    })

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.userPreferences.create({
        data: {
          userId: decodedToken.uid,
          emailNotifications: true,
          orderUpdates: true,
          promotions: false,
          darkMode: false,
          profileVisibility: true,
          dataSharing: false
        }
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

// PUT - Update user preferences
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decodedToken = await verifyIdToken(token)
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const {
      emailNotifications,
      orderUpdates,
      promotions,
      darkMode,
      profileVisibility,
      dataSharing
    } = body

    // Upsert user preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: decodedToken.uid },
      update: {
        emailNotifications: emailNotifications ?? undefined,
        orderUpdates: orderUpdates ?? undefined,
        promotions: promotions ?? undefined,
        darkMode: darkMode ?? undefined,
        profileVisibility: profileVisibility ?? undefined,
        dataSharing: dataSharing ?? undefined,
        updatedAt: new Date()
      },
      create: {
        userId: decodedToken.uid,
        emailNotifications: emailNotifications ?? true,
        orderUpdates: orderUpdates ?? true,
        promotions: promotions ?? false,
        darkMode: darkMode ?? false,
        profileVisibility: profileVisibility ?? true,
        dataSharing: dataSharing ?? false
      }
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
