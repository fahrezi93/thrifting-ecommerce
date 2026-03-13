import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendResolvedEmail } from '@/lib/email-service'

export async function PATCH(
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

    // Get the contact message
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id: params.id }
    })

    if (!contactMessage) {
      return NextResponse.json({ error: 'Contact message not found' }, { status: 404 })
    }

    // Send resolved email notification
    const emailSent = await sendResolvedEmail(
      contactMessage.email,
      contactMessage.name,
      contactMessage.subject
    )

    if (!emailSent) {
      console.warn('Failed to send resolved email notification')
      // Don't fail the request if email fails, just log it
    }

    // Update contact message status to RESOLVED
    const updatedMessage = await prisma.contactMessage.update({
      where: { id: params.id },
      data: {
        status: 'RESOLVED',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Contact message marked as resolved',
      contactMessage: updatedMessage,
      emailSent
    })

  } catch (error) {
    console.error('Error marking as resolved:', error)
    return NextResponse.json(
      { error: 'Failed to mark as resolved' },
      { status: 500 }
    )
  }
}
