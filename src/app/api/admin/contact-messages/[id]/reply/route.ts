import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyIdToken } from '@/lib/firebase-admin'
import { sendReplyEmail } from '@/lib/email-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { replyMessage } = await request.json()

    if (!replyMessage || replyMessage.trim() === '') {
      return NextResponse.json({ error: 'Reply message is required' }, { status: 400 })
    }

    // Get the contact message
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id: params.id }
    })

    if (!contactMessage) {
      return NextResponse.json({ error: 'Contact message not found' }, { status: 404 })
    }

    // Send reply email
    const emailSent = await sendReplyEmail(
      contactMessage.email,
      contactMessage.name,
      contactMessage.subject,
      replyMessage
    )

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send reply email' }, { status: 500 })
    }

    // Update contact message status to IN_PROGRESS
    const updatedMessage = await prisma.contactMessage.update({
      where: { id: params.id },
      data: {
        status: 'IN_PROGRESS',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
      contactMessage: updatedMessage
    })

  } catch (error) {
    console.error('Error sending reply:', error)
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    )
  }
}
