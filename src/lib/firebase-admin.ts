import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const serviceAccount = require('../../thrifting-ecommerce-firebase-adminsdk-fbsvc-d9f4bfdff5.json')

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: 'thrifting-ecommerce'
  })
}

export const adminAuth = getAuth()
export const adminDb = getFirestore()

// Helper function to verify Firebase ID token
export async function verifyIdToken(idToken: string) {
  try {
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
    const customToken = await adminAuth.createCustomToken(uid)
    return customToken
  } catch (error) {
    console.error('Error creating custom token:', error)
    throw error
  }
}
