import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyIdToken } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { uid, email, name, emailVerified, image, idToken } = await request.json()

    // Verify the Firebase ID token if provided
    if (idToken) {
      try {
        const decodedToken = await verifyIdToken(idToken)
        if (decodedToken.uid !== uid) {
          return NextResponse.json(
            { error: 'Token UID mismatch' },
            { status: 401 }
          )
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }
    }

    // Determine role based on email
    const role = email === 'admin@admin.com' ? 'ADMIN' : 'USER'

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { id: uid },
      update: {
        email,
        name,
        emailVerified,
        image,
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
