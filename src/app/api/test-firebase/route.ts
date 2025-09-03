import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdminStatus, retryFirebaseAdminInit } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    console.log('=== Firebase Admin SDK Test Endpoint ===')
    
    // Get current Firebase Admin status
    const status = getFirebaseAdminStatus()
    console.log('Firebase Admin Status:', status)
    
    // Check environment variable details
    const hasEnvVar = !!process.env.FIREBASE_ADMIN_SDK_JSON
    let envVarDetails = null
    
    if (hasEnvVar) {
      const envVarLength = process.env.FIREBASE_ADMIN_SDK_JSON?.length || 0
      console.log('Environment variable length:', envVarLength)
      
      // Try to parse the JSON to validate format
      try {
        const parsed = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON!)
        envVarDetails = {
          project_id: parsed.project_id,
          client_email: parsed.client_email,
          hasPrivateKey: !!parsed.private_key,
          privateKeyLength: parsed.private_key?.length || 0
        }
        console.log('Environment variable details:', envVarDetails)
      } catch (parseError) {
        console.error('Failed to parse FIREBASE_ADMIN_SDK_JSON:', parseError)
        return NextResponse.json({
          success: false,
          error: 'Failed to parse Firebase credentials JSON',
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          status,
          envVarLength
        }, { status: 500 })
      }
    }
    
    // If initialization failed, try to retry
    if (status.initializationError && hasEnvVar) {
      console.log('Retrying Firebase Admin initialization...')
      const retryResult = retryFirebaseAdminInit()
      console.log('Retry result:', retryResult)
    }
    
    // Test Firebase Admin functionality
    let testResults = {
      canGetApps: false,
      appsCount: 0,
      canGetAuth: false,
      authTest: null as any
    }
    
    try {
      const { getApps } = await import('firebase-admin/app')
      const { getAuth } = await import('firebase-admin/auth')
      
      testResults.canGetApps = true
      testResults.appsCount = getApps().length
      console.log('Current Firebase apps count:', testResults.appsCount)
      
      if (testResults.appsCount > 0) {
        const auth = getAuth()
        testResults.canGetAuth = true
        
        // Try to create a custom token as a test (this will fail if credentials are invalid)
        try {
          // This is just a test - we're not actually using this token
          await auth.createCustomToken('test-uid-12345')
          testResults.authTest = 'success'
        } catch (authError) {
          testResults.authTest = authError instanceof Error ? authError.message : 'Unknown auth error'
        }
      }
      
    } catch (importError) {
      console.error('Failed to import Firebase Admin modules:', importError)
      return NextResponse.json({
        success: false,
        error: 'Failed to import Firebase Admin modules',
        details: importError instanceof Error ? importError.message : 'Unknown import error',
        status,
        envVarDetails
      }, { status: 500 })
    }
    
    const finalStatus = getFirebaseAdminStatus()
    
    return NextResponse.json({
      success: !finalStatus.initializationError,
      message: finalStatus.initializationError ? 'Firebase Admin SDK has initialization errors' : 'Firebase Admin SDK test completed',
      status: finalStatus,
      envVarDetails,
      testResults,
      timestamp: new Date().toISOString()
    })
    
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
