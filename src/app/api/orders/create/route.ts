import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface OrderItem {
  productId: string
  quantity: number
  price: number
}

interface CreateOrderRequest {
  items: OrderItem[]
  shippingAddressId: string
  shippingCost: number
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { items, shippingAddressId, shippingCost, notes }: CreateOrderRequest = await request.json()

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 })
    }

    if (!shippingAddressId) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 })
    }

    // Verify shipping address belongs to user
    const shippingAddress = await prisma.address.findFirst({
      where: {
        id: shippingAddressId,
        userId: user.id
      }
    })

    if (!shippingAddress) {
      return NextResponse.json({ error: 'Invalid shipping address' }, { status: 400 })
    }

    // Verify all products exist and calculate total
    let totalAmount = 0
    const validatedItems: Array<{
      productId: string;
      quantity: number;
      price: number;
    }> = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        }, { status: 400 })
      }

      totalAmount += item.price * item.quantity
      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })
    }

    // Add shipping cost
    totalAmount += shippingCost

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          shippingAddressId,
          totalAmount,
          shippingCost,
          notes,
          status: 'PENDING',
          orderItems: {
            create: validatedItems
          }
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrls: true,
                  price: true
                }
              }
            }
          },
          shippingAddress: true
        }
      })

      // Reserve stock (don't reduce yet, just mark as reserved)
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      return newOrder
    })

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        shippingCost: order.shippingCost,
        status: order.status,
        items: order.orderItems.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.product.imageUrls ? JSON.parse(item.product.imageUrls)[0] : null
        })),
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt
      }
    })

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
