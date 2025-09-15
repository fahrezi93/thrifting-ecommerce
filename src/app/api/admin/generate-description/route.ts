import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'

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
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
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

    // Call Gemini AI API
    console.log('Calling Gemini API with key:', apiKey ? 'Key present' : 'Key missing')
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
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
    })

    console.log('Gemini API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.statusText, errorText)
      return NextResponse.json({ 
        error: `Failed to generate description: ${response.statusText}`,
        details: errorText
      }, { status: 500 })
    }

    const data = await response.json()
    console.log('Gemini API response:', JSON.stringify(data, null, 2))
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini response structure:', data)
      return NextResponse.json({ error: 'Invalid response from AI service' }, { status: 500 })
    }

    const generatedDescription = data.candidates[0].content.parts[0].text

    return NextResponse.json({ 
      success: true, 
      description: generatedDescription.trim()
    })

  } catch (error) {
    console.error('Error generating description:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
