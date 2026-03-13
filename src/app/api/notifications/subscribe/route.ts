import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Parse request body
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // The client sends the raw PushSubscription object directly via JSON.stringify(subscription)
    // This puts endpoint, expirationTime, keys at the top level of the body
    // Also support wrapped format: { subscription: { endpoint, keys, ... } }
    const subscription = body.endpoint ? body : (body.subscription as Record<string, unknown> | undefined)

    const endpoint = subscription?.endpoint as string | undefined
    const keys = subscription?.keys as { p256dh?: string; auth?: string } | undefined

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      console.error('Invalid subscription data received:', JSON.stringify(body, null, 2))
      return NextResponse.json(
        { error: 'Invalid subscription data: missing endpoint or keys' },
        { status: 400 }
      )
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: { endpoint }
    })

    if (existingSubscription) {
      // Update existing subscription
      await prisma.pushSubscription.update({
        where: { endpoint },
        data: {
          userId,
          p256dh: keys.p256dh,
          auth: keys.auth,
          isActive: true,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new subscription
      await prisma.pushSubscription.create({
        data: {
          userId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent: request.headers.get('user-agent') || '',
          isActive: true
        }
      })
    }

    console.log(`Push subscription saved for user ${userId}`)

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
