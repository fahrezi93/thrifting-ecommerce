import { NextRequest } from 'next/server'
import { prisma } from './prisma'

import { adminAuth } from './firebase-admin'

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
    
    if (!adminAuth) {
      // Fallback: decode JWT manually to get UID (when Firebase Admin SDK is not available)
      console.log('Firebase Admin SDK not available, using fallback authentication')
      try {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
        console.log('Decoded token payload:', { 
          user_id: payload.user_id, 
          sub: payload.sub, 
          email: payload.email,
          aud: payload.aud,
          iss: payload.iss
        })
        
        // Validate that this is a Firebase token
        if (!payload.iss || !payload.iss.includes('securetoken.google.com')) {
          console.log('Invalid token issuer:', payload.iss)
          return null
        }
        
        if (!payload.aud || payload.aud !== 'thrifting-ecommerce') {
          console.log('Invalid token audience:', payload.aud)
          return null
        }
        
        // Check token expiration
        const now = Math.floor(Date.now() / 1000)
        if (payload.exp && payload.exp < now) {
          console.log('Token expired:', payload.exp, 'current:', now)
          return null
        }
        
        const userId = payload.user_id || payload.sub
        if (!userId) {
          console.log('No user ID found in token payload')
          return null
        }
        
        const user = await prisma.user.findUnique({
          where: { id: userId }
        })
        
        if (!user) {
          console.log('User not found in database:', userId)
          return null
        }
        
        console.log('Fallback authentication successful for user:', user.email, 'role:', user.role)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          firebaseUid: user.id
        }
      } catch (fallbackError) {
        console.error('Fallback token decode failed:', fallbackError)
        return null
      }
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
