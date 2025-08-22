import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request)
    const { status } = await request.json()

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
