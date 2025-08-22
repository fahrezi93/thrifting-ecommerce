import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Get user from database to check role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({ role: dbUser.role })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error checking user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
