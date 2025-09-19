import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

let adminAuth: any = null
let adminDb: any = null
let initializationAttempted = false
let initializationError: Error | null = null

function initializeFirebaseAdmin() {
  if (initializationAttempted) {
    return { adminAuth, adminDb, error: initializationError }
  }
  
  initializationAttempted = true
  
  try {
    let serviceAccount;
    
    // Try to get credentials from environment variable first (for production/Vercel)
    if (process.env.FIREBASE_ADMIN_SDK_JSON && process.env.FIREBASE_ADMIN_SDK_JSON.length > 50) {
      console.log('Found FIREBASE_ADMIN_SDK_JSON environment variable')
      const envValue = process.env.FIREBASE_ADMIN_SDK_JSON
      console.log('Environment variable length:', envValue.length)
      console.log('Environment starts with:', envValue.substring(0, 50))
      
      try {
        // Clean the environment variable value
        let cleanValue = envValue.trim()
        
        // Remove any quotes that might wrap the entire JSON
        if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) || 
            (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
          cleanValue = cleanValue.slice(1, -1)
        }
        
        // Replace escaped quotes and newlines
        cleanValue = cleanValue.replace(/\\"/g, '"').replace(/\\n/g, '\n')
        
        serviceAccount = JSON.parse(cleanValue);
        console.log('✅ Successfully parsed Firebase Admin SDK from environment variable')
        console.log('Project ID:', serviceAccount.project_id)
        console.log('Client email:', serviceAccount.client_email?.substring(0, 20) + '...')
      } catch (parseError) {
        console.error('❌ Failed to parse FIREBASE_ADMIN_SDK_JSON:', parseError)
        console.log('Environment variable preview:', envValue.substring(0, 200) + '...')
        throw new Error(`Invalid JSON in FIREBASE_ADMIN_SDK_JSON: ${parseError}`)
      }
    } else {
      // Fallback to local file (for development only)
      console.log('FIREBASE_ADMIN_SDK_JSON not found, trying local file')
      try {
        // Use dynamic import to prevent build errors when file doesn't exist
        const fs = require('fs')
        const path = require('path')
        const filePath = path.join(process.cwd(), 'thrifting-ecommerce-firebase-adminsdk-fbsvc-d9f4bfdff5.json')
        
        console.log('Looking for Firebase Admin SDK file at:', filePath)
        
        if (fs.existsSync(filePath)) {
          console.log('Firebase Admin SDK file found, reading...')
          try {
            const fileContent = fs.readFileSync(filePath, 'utf8')
            console.log('File content length:', fileContent.length)
            console.log('First 50 characters:', fileContent.substring(0, 50))
            
            // Check for BOM and remove if present
            const cleanContent = fileContent.replace(/^\uFEFF/, '')
            serviceAccount = JSON.parse(cleanContent)
            console.log('Successfully loaded Firebase Admin SDK from local file')
            console.log('Project ID from file:', serviceAccount.project_id)
            console.log('Client email from file:', serviceAccount.client_email)
          } catch (parseError) {
            console.error('Failed to parse Firebase Admin SDK JSON file:', parseError)
            throw new Error(`Invalid JSON in Firebase Admin SDK file: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`)
          }
        } else {
          console.error('Firebase Admin SDK file does not exist at:', filePath)
          throw new Error(`Local Firebase Admin SDK file not found at: ${filePath}`)
        }
      } catch (fileError) {
        console.error('Error reading local Firebase Admin SDK file:', fileError)
        throw new Error(`Firebase Admin SDK file error: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`)
      }
    }
    
    // Validate required fields
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('Invalid Firebase Admin SDK credentials - missing required fields')
    }
    
    // Initialize Firebase Admin SDK
    if (!getApps().length) {
      const app = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      })
      console.log('Firebase Admin app initialized:', app.name)
    }
    
    adminAuth = getAuth()
    adminDb = getFirestore()
    console.log('Firebase Admin SDK initialized successfully')
    
    return { adminAuth, adminDb, error: null }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error)
    initializationError = error instanceof Error ? error : new Error('Unknown initialization error')
    return { adminAuth: null, adminDb: null, error: initializationError }
  }
}

// Initialize on module load
initializeFirebaseAdmin()

export { adminAuth, adminDb }

// Export function to get initialization status and retry if needed
export function getFirebaseAdminStatus() {
  return {
    adminAuth,
    adminDb,
    initializationAttempted,
    initializationError: initializationError?.message || null,
    hasEnvVar: !!process.env.FIREBASE_ADMIN_SDK_JSON
  }
}

// Export function to retry initialization
export function retryFirebaseAdminInit() {
  console.log('Retrying Firebase Admin initialization...')
  initializationAttempted = false
  initializationError = null
  adminAuth = null
  adminDb = null
  return initializeFirebaseAdmin()
}

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
