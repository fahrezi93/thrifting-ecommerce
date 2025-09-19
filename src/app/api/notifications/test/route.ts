import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/firebase-admin'
import webpush from 'web-push'

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

    // Check VAPID configuration
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'VAPID keys not configured' },
        { status: 500 }
      )
    }

    // Configure web-push
    webpush.setVapidDetails(
      'mailto:admin@thrifthaven.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    )

    const { title, body, url, icon } = await request.json()

    // Get user's push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: userId,
        isActive: true
      }
    })

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No active push subscriptions found for user' },
        { status: 404 }
      )
    }

    const payload = JSON.stringify({
      title: title || '🧪 Test Notification',
      body: body || 'This is a test push notification!',
      icon: icon || '/Logo-App-Mobile.svg',
      badge: '/Logo-App-Mobile.svg',
      url: url || '/dashboard',
      tag: 'test-notification',
      data: {
        url: url || '/dashboard',
        timestamp: Date.now(),
        type: 'test'
      },
      actions: [
        {
          action: 'view',
          title: 'Open App',
          icon: '/Logo-App-Mobile.svg'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      vibrate: [200, 100, 200],
      requireInteraction: false
    })

    // Send to all user's subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            },
            payload
          )
          return { success: true, endpoint: sub.endpoint }
        } catch (error) {
          console.error('Failed to send test notification:', error)
          
          // Mark subscription as inactive if it's invalid
          if (error instanceof Error && (error.message.includes('410') || error.message.includes('gone'))) {
            await prisma.pushSubscription.update({
              where: { id: sub.id },
              data: { isActive: false }
            })
          }
          
          return { success: false, endpoint: sub.endpoint, error: error instanceof Error ? error.message : String(error) }
        }
      })
    )

    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length

    const failed = results.length - successful

    console.log(`Test notification sent: ${successful} successful, ${failed} failed`)

    return NextResponse.json({
      success: true,
      message: `Test notification sent to ${successful} subscription(s)`,
      sent: successful,
      failed: failed,
      total: subscriptions.length
    })

  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send test notification',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
