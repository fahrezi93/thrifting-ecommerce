import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Fetch user preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user preferences, create default if doesn't exist
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id }
    })

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
          emailNotifications: true,
          orderUpdates: true,
          promotions: false,
          theme: "light",
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
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      emailNotifications,
      orderUpdates,
      promotions,
      theme,
      profileVisibility,
      dataSharing
    } = body

    // Upsert user preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        emailNotifications: emailNotifications ?? undefined,
        orderUpdates: orderUpdates ?? undefined,
        promotions: promotions ?? undefined,
        theme: theme ?? undefined,
        profileVisibility: profileVisibility ?? undefined,
        dataSharing: dataSharing ?? undefined,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        emailNotifications: emailNotifications ?? true,
        orderUpdates: orderUpdates ?? true,
        promotions: promotions ?? false,
        theme: theme ?? "light",
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
