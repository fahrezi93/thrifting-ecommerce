import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getServerSession(request)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Count unread contact messages (PENDING and IN_PROGRESS)
    const count = await (prisma as any).contactMessage.count({
      where: {
        status: {
          in: ['PENDING', 'IN_PROGRESS']
        }
      }
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error fetching unread contact messages count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch count' },
      { status: 500 }
    )
  }
}
