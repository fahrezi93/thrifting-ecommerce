import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (existingAdmin) {
      return NextResponse.json({ 
        message: 'Admin already exists',
        adminEmail: 'admin@admin.com',
        password: '123456'
      })
    }
    
    // Create a placeholder admin user in database
    // The actual Firebase user will be created when they sign up normally
    const adminInfo = {
      email: 'admin@admin.com',
      password: '123456',
      name: 'Administrator'
    }
    
    return NextResponse.json({ 
      message: 'Admin credentials ready',
      instructions: 'Please sign up with these credentials through the normal signup form',
      credentials: adminInfo
    })
  } catch (error: any) {
    console.error('Error setting up admin:', error)
    return NextResponse.json({ error: 'Failed to setup admin' }, { status: 500 })
  }
}
