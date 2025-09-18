import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyIdToken } from '@/lib/firebase-admin'

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

    // Check if contact message exists
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id: params.id }
    })

    if (!contactMessage) {
      return NextResponse.json({ error: 'Contact message not found' }, { status: 404 })
    }

    // Update contact message status to CLOSED
    const updatedMessage = await prisma.contactMessage.update({
      where: { id: params.id },
      data: {
        status: 'CLOSED',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Contact message closed successfully',
      contactMessage: updatedMessage
    })

  } catch (error) {
    console.error('Error closing contact message:', error)
    return NextResponse.json(
      { error: 'Failed to close contact message' },
      { status: 500 }
    )
  }
}
