import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

// POST - Submit contact message
export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Get user session if available (optional)
    let userId = null
    try {
      const user = await getServerSession(request)
      if (user) {
        userId = user.id
      }
    } catch (error) {
      // User not logged in, that's fine for contact form
    }

    // Create contact message
    const contactMessage = await (prisma as any).contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        userId,
        status: 'PENDING'
      }
    })

    // TODO: Send email notification to admin
    // You can integrate with email services like:
    // - Nodemailer
    // - SendGrid
    // - AWS SES
    // - Resend
    
    console.log('New contact message received:', {
      id: contactMessage.id,
      name,
      email,
      subject,
      message: message.substring(0, 100) + '...'
    })

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! We\'ll get back to you within 24 hours.',
      id: contactMessage.id
    })
  } catch (error) {
    console.error('Error creating contact message:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}

// GET - Get all contact messages (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getServerSession(request)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = status ? { status: status as any } : {}

    const [messages, total] = await Promise.all([
      (prisma as any).contactMessage.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      (prisma as any).contactMessage.count({ where })
    ])

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching contact messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
