import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendReplyEmail } from '@/lib/email-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
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
