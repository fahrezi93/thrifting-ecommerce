import { NextRequest } from 'next/server'
import { adminAuth } from './firebase-admin'
import { prisma } from './prisma'

export interface AuthenticatedUser {
  id: string
  email: string
  name: string | null
  role: string
  firebaseUid: string
}

export async function getServerSession(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No valid authorization header found')
      return null
    }

    const token = authHeader.split('Bearer ')[1]
    if (!token || token.trim() === '') {
      console.log('Empty or invalid token')
      return null
    }

    console.log('Attempting to verify token:', token.substring(0, 20) + '...')
    
    // Validate token format - Firebase ID tokens are JWTs with 3 parts separated by dots
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) {
      console.log('Invalid token format - not a valid JWT')
      return null
    }
    
    const decodedToken = await adminAuth.verifyIdToken(token)
    
    // Get user from database using Firebase UID (stored as id)
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid }
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      firebaseUid: user.id // id is the Firebase UID
    }
  } catch (error) {
    console.error('Error verifying Firebase token:', error)
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await getServerSession(request)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAdmin(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await requireAuth(request)
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  return user
}
