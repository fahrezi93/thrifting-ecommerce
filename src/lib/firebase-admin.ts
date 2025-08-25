import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

let adminAuth: any = null
let adminDb: any = null

try {
  const serviceAccount = require('../../thrifting-ecommerce-firebase-adminsdk-fbsvc-d9f4bfdff5.json')
  
  // Initialize Firebase Admin SDK
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      projectId: 'thrifting-ecommerce'
    })
  }
  
  adminAuth = getAuth()
  adminDb = getFirestore()
  console.log('Firebase Admin SDK initialized successfully')
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error)
}

export { adminAuth, adminDb }

// Helper function to verify Firebase ID token
export async function verifyIdToken(idToken: string) {
  try {
    if (!adminAuth) {
      throw new Error('Firebase Admin SDK not initialized')
    }
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return decodedToken
  } catch (error) {
    console.error('Error verifying ID token:', error)
    throw error
  }
}

// Helper function to create custom token
export async function createCustomToken(uid: string) {
  try {
    if (!adminAuth) {
      throw new Error('Firebase Admin SDK not initialized')
    }
    const customToken = await adminAuth.createCustomToken(uid)
    return customToken
  } catch (error) {
    console.error('Error creating custom token:', error)
    throw error
  }
}
