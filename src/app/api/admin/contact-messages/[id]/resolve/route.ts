import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyIdToken } from '@/lib/firebase-admin'
import { sendResolvedEmail } from '@/lib/email-service'

export async function PATCH(
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
