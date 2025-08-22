import { NextRequest } from 'next/server'
import { verifyIdToken } from '@/lib/firebase-admin'

export async function requireAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided')
    }

    const idToken = authHeader.split('Bearer ')[1]
    const decodedToken = await verifyIdToken(idToken)
    
    return decodedToken
  } catch (error) {
    throw new Error('Authentication failed')
  }
}

export async function requireAdmin(request: NextRequest) {
  const decodedToken = await requireAuth(request)
  
  // Check if user has admin role in custom claims or database
  if (!decodedToken.admin && decodedToken.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  
  return decodedToken
}
