import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { uid, email, name, emailVerified, image } = await request.json()

    // Basic validation
    if (!uid || !email) {
      return NextResponse.json(
        { error: 'UID and email are required' },
        { status: 400 }
      )
    }

    // Determine role based on email - use enum values
    const role = email === 'admin@admin.com' ? 'ADMIN' : 'USER'

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { id: uid },
      update: {
        email,
        name,
        emailVerified,
        image,
        role, // Ensure role is also updated
        updatedAt: new Date()
      },
      create: {
        id: uid,
        email,
        name,
        emailVerified,
        image,
        role
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    )
  }
}
