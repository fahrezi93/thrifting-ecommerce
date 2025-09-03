import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Gemini API key not found',
        env: Object.keys(process.env).filter(key => key.includes('GEMINI'))
      }, { status: 500 })
    }

    // Simple test call to Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Say hello in Indonesian"
          }]
        }]
      })
    })

    const responseText = await response.text()
    
    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      keyPresent: !!apiKey,
      keyLength: apiKey.length,
      response: responseText
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
