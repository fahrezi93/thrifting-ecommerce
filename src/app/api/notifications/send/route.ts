import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import webpush from 'web-push'

export async function POST(request: NextRequest) {
  try {
    console.log('Push notification API called')
    console.log('Environment check:', {
      vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 'Present' : 'Missing',
      vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ? 'Present' : 'Missing'
    })

    // Check if VAPID keys are configured
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.error('VAPID keys not configured')
      return NextResponse.json(
        { error: 'VAPID keys not configured' },
        { status: 500 }
      )
    }

    // Configure web-push with VAPID keys at runtime
    try {
      webpush.setVapidDetails(
        'mailto:admin@thrifthaven.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      )
      console.log('VAPID details set successfully')
    } catch (vapidError) {
      console.error('Error setting VAPID details:', vapidError)
      return NextResponse.json(
        { error: 'Invalid VAPID configuration', details: vapidError instanceof Error ? vapidError.message : String(vapidError) },
        { status: 500 }
      )
    }

    const { title, body, icon, url, tag } = await request.json()

    // Get all active subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        isActive: true
      }
    })

    const payload = JSON.stringify({
      title: title || 'Thrift Haven',
      body: body || 'Check out our latest deals!',
      icon: icon || '/Logo-App-Mobile.svg',
      badge: '/Logo-App-Mobile.svg',
      url: url || '/',
      tag: tag || 'promo',
      data: {
        url: url || '/',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'view',
          title: 'View Deal',
          icon: '/Logo-App-Mobile.svg'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    })

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
          console.error('Failed to send notification:', error)
          
          // If subscription is invalid, mark as inactive
          if (error instanceof Error && error.message.includes('410')) {
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

    return NextResponse.json({
      success: true,
      sent: successful,
      failed: failed,
      total: subscriptions.length
    })

  } catch (error) {
    console.error('Error sending notifications:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 'Present' : 'Missing',
      vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ? 'Present' : 'Missing'
    })
    return NextResponse.json(
      { 
        error: 'Failed to send notifications',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
