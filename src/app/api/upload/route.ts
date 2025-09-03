import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { uploadProductImage } from '@/lib/firebase-storage'

export async function POST(request: NextRequest) {
  console.log('Upload API called')
  try {
    // Check authentication first (less strict for debugging)
    console.log('Checking authentication...')
    const user = await getServerSession(request)
    
    if (!user) {
      console.log('No user session found')
      return NextResponse.json({ error: 'Please login first' }, { status: 401 })
    }
    
    if (user.role !== 'ADMIN') {
      console.log('User is not admin:', user.role)
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    console.log('Authentication successful:', user.email, 'role:', user.role)

    console.log('Parsing form data...')
    const data = await request.formData()
    console.log('Form data keys:', Array.from(data.keys()))
    
    const file: File | null = data.get('file') as unknown as File
    console.log('File received:', file ? `${file.name} (${file.size} bytes, ${file.type})` : 'null')

    if (!file) {
      console.log('No file in form data')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.log('File too large:', file.size, 'bytes')
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 })
    }

    console.log('Uploading file to Firebase Storage...')
    // Upload to Firebase Storage instead of local filesystem
    const imageUrl = await uploadProductImage(file)
    console.log('File uploaded successfully:', imageUrl)

    return NextResponse.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: file.name
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized - Please login first' }, { status: 401 })
      }
      if (error.message === 'Admin access required') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
      
      // Log the specific error for debugging
      console.error('Upload error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined 
    }, { status: 500 })
  }
}
