'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Package, Truck, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  orderItems: Array<{
    id: string
    quantity: number
    price: number
    product: {
      name: string
      imageUrls: string
    }
  }>
}

export default function AdminOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      if (!user) return
      
      const token = await user.getIdToken()
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      if (!user) return
      
      const token = await user.getIdToken()
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (response.ok) {
        fetchOrders() // Refresh orders
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pending', variant: 'secondary' as const },
      PAID: { label: 'Paid', variant: 'default' as const },
      SHIPPED: { label: 'Shipped', variant: 'outline' as const },
      COMPLETED: { label: 'Completed', variant: 'default' as const },
      CANCELLED: { label: 'Cancelled', variant: 'destructive' as const },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return <div>Loading orders...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground">
          Manage customer orders and update their status
        </p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                    <CardDescription>
                      {order.user.name} • {order.user.email}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.orderItems.map((item) => {
                      const images = JSON.parse(item.product.imageUrls)
                      return (
                        <div key={item.id} className="flex items-center space-x-3 p-2 bg-muted rounded">
                          <img
                            src={images[0]}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Total and Actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="font-semibold">Total: {formatPrice(order.totalAmount)}</p>
                    </div>
                    <div className="flex space-x-2">
                      {order.status === 'PAID' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                        >
                          <Truck className="w-4 h-4 mr-1" />
                          Ship Order
                        </Button>
                      )}
                      {order.status === 'SHIPPED' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      {(order.status === 'PENDING' || order.status === 'PAID') && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
