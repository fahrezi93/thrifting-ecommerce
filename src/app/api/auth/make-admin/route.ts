import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
      select: { id: true, email: true, role: true }
    })
    
    return NextResponse.json({ 
      message: 'User role updated to ADMIN successfully',
      user: updatedUser 
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
