import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Retry logic with exponential backoff
async function callGeminiWithRetry(apiKey: string, prompt: string, maxRetries = 3) {
  let lastError: any = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Gemini API attempt ${attempt + 1}/${maxRetries}`)
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      )

      console.log('Gemini API response status:', response.status)

      // If rate limited (429), wait and retry
      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000 // Exponential backoff: 1s, 2s, 4s
        console.log(`Rate limited. Waiting ${waitTime}ms before retry...`)
        
        if (attempt < maxRetries - 1) {
          await delay(waitTime)
          continue
        }
        
        // Last attempt failed
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Rate limit exceeded. Please try again in a few minutes. ${errorData.error?.message || ''}`)
      }

      // Other errors
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Gemini API error:', response.statusText, errorText)
        throw new Error(`API error: ${response.statusText}`)
      }

      // Success
      const data = await response.json()
      console.log('Gemini API response received')
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Invalid Gemini response structure:', data)
        throw new Error('Invalid response structure from AI service')
      }

      return data.candidates[0].content.parts[0].text

    } catch (error: any) {
      lastError = error
      console.error(`Attempt ${attempt + 1} failed:`, error.message)
      
      // If it's not a rate limit error, don't retry
      if (!error.message.includes('Rate limit') && !error.message.includes('429')) {
        throw error
      }
      
      // Wait before next retry (except on last attempt)
      if (attempt < maxRetries - 1) {
        const waitTime = Math.pow(2, attempt) * 1000
        await delay(waitTime)
      }
    }
  }
  
  throw lastError || new Error('Failed after multiple retries')
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await getServerSession(request)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productName, category, brand, color, size, condition } = await request.json()

    if (!productName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured. Please contact administrator.' 
      }, { status: 500 })
    }

    // Create prompt for Gemini AI
    const prompt = `Write a single, clean product description in English for this thrift store item:

Product Name: ${productName}
Category: ${category || 'Not specified'}
Brand: ${brand || 'Not specified'}
Color: ${color || 'Not specified'}
Size: ${size || 'Not specified'}
Condition: ${condition || 'Not specified'}

Requirements:
- Write ONLY the description text, no options or alternatives
- Use plain text without any markdown formatting (no ** or ## symbols)
- Keep it 2-3 sentences maximum
- Mention the condition and key features
- Use engaging language for thrift shoppers
- Focus on style, quality, and value

Return only the description text, nothing else.`

    // Call Gemini AI API with retry logic
    const generatedDescription = await callGeminiWithRetry(apiKey, prompt)

    return NextResponse.json({ 
      success: true, 
      description: generatedDescription.trim()
    })

  } catch (error: any) {
    console.error('Error generating description:', error)
    
    // User-friendly error messages
    if (error.message.includes('Rate limit')) {
      return NextResponse.json({ 
        error: 'AI service is currently busy. Please wait a moment and try again.',
        retryable: true
      }, { status: 429 })
    }
    
    return NextResponse.json({ 
      error: error.message || 'Failed to generate description. Please try again.',
      retryable: true
    }, { status: 500 })
  }
}
