import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== Firebase Admin SDK Test Endpoint ===')
    
    // Check if environment variable exists
    const hasEnvVar = !!process.env.FIREBASE_ADMIN_SDK_JSON
    console.log('FIREBASE_ADMIN_SDK_JSON exists:', hasEnvVar)
    
    if (hasEnvVar) {
      console.log('Environment variable length:', process.env.FIREBASE_ADMIN_SDK_JSON?.length)
      
      // Try to parse the JSON
      try {
        const parsed = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON!)
        console.log('JSON parsed successfully')
        console.log('Project ID from credentials:', parsed.project_id)
        console.log('Client email from credentials:', parsed.client_email)
      } catch (parseError) {
        console.error('Failed to parse FIREBASE_ADMIN_SDK_JSON:', parseError)
        return NextResponse.json({
          success: false,
          error: 'Failed to parse Firebase credentials JSON',
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        }, { status: 500 })
      }
    }
    
    // Try to import and initialize Firebase Admin
    try {
      const { getApps, initializeApp, cert } = await import('firebase-admin/app')
      const { getAuth } = await import('firebase-admin/auth')
      
      console.log('Firebase Admin modules imported successfully')
      console.log('Current apps count:', getApps().length)
      
      if (!getApps().length && hasEnvVar) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON!)
        
        const app = initializeApp({
          credential: cert(serviceAccount),
          projectId: 'thrifting-ecommerce'
        })
        
        console.log('Firebase Admin app initialized:', app.name)
      }
      
      const auth = getAuth()
      console.log('Firebase Auth instance obtained')
      
      return NextResponse.json({
        success: true,
        message: 'Firebase Admin SDK test successful',
        hasEnvVar,
        appsCount: getApps().length,
        timestamp: new Date().toISOString()
      })
      
    } catch (firebaseError) {
      console.error('Firebase initialization error:', firebaseError)
      return NextResponse.json({
        success: false,
        error: 'Firebase initialization failed',
        details: firebaseError instanceof Error ? firebaseError.message : 'Unknown Firebase error',
        stack: firebaseError instanceof Error ? firebaseError.stack : undefined
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('General error in test endpoint:', error)
    return NextResponse.json({
      success: false,
      error: 'General error in test endpoint',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
