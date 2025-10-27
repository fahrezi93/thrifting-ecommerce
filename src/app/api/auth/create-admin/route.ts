import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * SECURITY: This endpoint is protected with a secret key
 * Only use this endpoint during initial setup
 * After creating the first admin, consider disabling this endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require secret key for admin creation
    const authHeader = request.headers.get('authorization')
    const secretKey = process.env.ADMIN_CREATION_SECRET
    
    if (!secretKey) {
      return NextResponse.json({ 
        error: 'Admin creation is disabled. Create admin manually via database.' 
      }, { status: 403 })
    }
    
    if (!authHeader || authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json({ 
        error: 'Unauthorized. Invalid or missing secret key.' 
      }, { status: 401 })
    }
    
    const { email, password, name } = await request.json()
    
    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ 
        error: 'Missing required fields: email, password, name' 
      }, { status: 400 })
    }
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (existingAdmin) {
      return NextResponse.json({ 
        error: 'Admin already exists. Only one admin can be created through this endpoint.',
        existingAdminEmail: existingAdmin.email
      }, { status: 409 })
    }
    
    // Return instructions for manual admin creation
    return NextResponse.json({ 
      message: 'Admin creation endpoint is protected',
      instructions: [
        '1. Sign up normally through the app with your admin email',
        '2. Use Prisma Studio to change the user role to ADMIN',
        '3. Run: npx prisma studio',
        '4. Find your user and change role from USER to ADMIN'
      ],
      providedData: {
        email,
        name,
        note: 'Password will be set during signup'
      }
    })
  } catch (error: any) {
    console.error('Error in admin creation endpoint:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
