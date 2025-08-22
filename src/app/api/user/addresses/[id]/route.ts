import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../../lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const { name, street, city, state, postalCode, country, phone, isDefault } = await request.json()

    // Verify the address belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // If this is set as default, unset other default addresses
    if (isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: user.id,
          isDefault: true,
          id: { not: params.id }
        },
        data: { isDefault: false }
      })
    }

    const updatedAddress = await prisma.address.update({
      where: { id: params.id },
      data: {
        name,
        street,
        city,
        state,
        postalCode,
        country,
        phone,
        isDefault,
      }
    })

    return NextResponse.json(updatedAddress)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating address:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Verify the address belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    await prisma.address.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Address deleted successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting address:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
