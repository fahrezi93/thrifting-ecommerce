import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Notification API called')
    
    const { title, body, icon, url, tag } = await request.json()

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      )
    }

    console.log('📝 Notification data:', { title, body, url, tag })

    // Get all active users to send notifications to
    const users = await prisma.user.findMany({
      where: {
        role: 'USER' // Only send to regular users, not admins
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    console.log(`👥 Found ${users.length} users to notify`)

    let sentCount = 0
    let failedCount = 0

    // Send real-time notifications via Pusher and save to database
    const notificationPromises = users.map(async (user) => {
      try {
        // Create notification in database
        const notification = await prisma.notification.create({
          data: {
            userId: user.id,
            title: title,
            message: body,
            type: tag || 'promo',
            url: url || '/',
            isRead: false
          }
        })

        // Send real-time notification via Pusher
        await pusher.trigger(`user-${user.id}`, 'notification', {
          id: notification.id,
          title: title,
          message: body,
          type: tag || 'promo',
          url: url || '/',
          icon: icon || '/Logo-App-Mobile.svg',
          timestamp: notification.createdAt.toISOString(),
          isRead: false
        })

        console.log(`✅ Notification sent to user ${user.id} (${user.email})`)
        return { success: true, userId: user.id }
      } catch (error) {
        console.error(`❌ Failed to send notification to user ${user.id}:`, error)
        return { success: false, userId: user.id, error: error instanceof Error ? error.message : String(error) }
      }
    })

    // Wait for all notifications to be processed
    const results = await Promise.allSettled(notificationPromises)
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        sentCount++
      } else {
        failedCount++
      }
    })

    console.log(`📊 Notification results: ${sentCount} sent, ${failedCount} failed`)

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: users.length,
      message: `Successfully sent ${sentCount} notifications to users`
    })

  } catch (error) {
    console.error('❌ Error sending notifications:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send notifications',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
