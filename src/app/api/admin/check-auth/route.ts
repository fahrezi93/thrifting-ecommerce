import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getServerSession(request)
    
    return NextResponse.json({
      authenticated: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        roleType: typeof user.role
      } : null,
      isAdmin: user?.role === 'ADMIN',
      roleCheck: {
        exact: user?.role === 'ADMIN',
        lowercase: user?.role === 'admin',
        uppercase: user?.role === 'ADMIN'
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Auth check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
