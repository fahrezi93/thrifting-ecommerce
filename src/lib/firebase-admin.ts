import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

let adminAuth: any = null
let adminDb: any = null

try {
  let serviceAccount;
  
  // Try to get credentials from environment variable first (for production/Vercel)
  if (process.env.FIREBASE_ADMIN_SDK_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON);
    console.log('Using Firebase Admin SDK from environment variable')
  } else {
    // Fallback to local file (for development)
    try {
      serviceAccount = require('../../../thrifting-ecommerce-firebase-adminsdk-fbsvc-d9f4bfdff5.json')
      console.log('Using Firebase Admin SDK from local file')
    } catch (fileError) {
      console.error('Local Firebase Admin SDK file not found:', fileError)
      throw new Error('Firebase Admin SDK credentials not available')
    }
  }
  
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
