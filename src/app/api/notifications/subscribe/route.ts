import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid

    const { subscription, userId: bodyUserId } = await request.json()
    
    // Use userId from token (more secure) or from body as fallback
    const finalUserId = userId || bodyUserId

    if (!finalUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint }
    })

    if (existingSubscription) {
      // Update existing subscription
      await prisma.pushSubscription.update({
        where: { endpoint: subscription.endpoint },
        data: {
          userId: finalUserId,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          isActive: true,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new subscription
      await prisma.pushSubscription.create({
        data: {
          userId: finalUserId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent: request.headers.get('user-agent') || '',
          isActive: true
        }
      })
    }

    console.log(`Push subscription saved for user ${finalUserId}`)

    return NextResponse.json({ 
      success: true,
      message: 'Push subscription saved successfully'
    })
  } catch (error) {
    console.error('Error saving subscription:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save subscription',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
