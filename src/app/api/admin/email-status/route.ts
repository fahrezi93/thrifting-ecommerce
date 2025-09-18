import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check if Resend API key is configured
    const hasResendKey = !!process.env.RESEND_API_KEY
    
    // Check if FROM_EMAIL is configured
    const hasFromEmail = !!process.env.FROM_EMAIL
    
    return NextResponse.json({
      hasResendKey,
      hasFromEmail,
      emailService: hasResendKey ? 'resend' : 'development',
      fromEmail: hasFromEmail ? process.env.FROM_EMAIL : 'Not configured'
    })
  } catch (error) {
    console.error('Error checking email status:', error)
    return NextResponse.json(
      { error: 'Failed to check email status' },
      { status: 500 }
    )
  }
}
