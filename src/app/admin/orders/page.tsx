'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Eye, Package, Truck, CheckCircle, XCircle, Trash2, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

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
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      if (!user) return
      
      const data = await apiClient.get('/api/admin/orders')
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      if (!user) return
      
      await apiClient.put(`/api/admin/orders/${orderId}`, { status: newStatus })
      toast.success('Order status updated successfully')
      fetchOrders() // Refresh orders
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const deleteOrder = async (orderId: string) => {
    try {
      if (!user) return
      
      await apiClient.delete(`/api/admin/orders/${orderId}`)
      toast.success('Order deleted successfully')
      fetchOrders() // Refresh orders
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error('Failed to delete order')
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
      PROCESSING: { label: 'Processing', variant: 'default' as const },
      PAID: { label: 'Paid', variant: 'default' as const },
      SHIPPED: { label: 'Shipped', variant: 'outline' as const },
      DELIVERED: { label: 'Delivered', variant: 'default' as const },
      COMPLETED: { label: 'Completed', variant: 'default' as const },
      CANCELLED: { label: 'Cancelled', variant: 'destructive' as const },
      FAILED: { label: 'Failed', variant: 'destructive' as const },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filterOrders = (orders: Order[], status: string, query: string) => {
    let filtered = orders

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(order => order.status === status.toUpperCase())
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
        order.user.name.toLowerCase().includes(query.toLowerCase()) ||
        order.user.email.toLowerCase().includes(query.toLowerCase())
      )
    }

    return filtered
  }

  const getOrderCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      processing: orders.filter(o => o.status === 'PROCESSING').length,
      paid: orders.filter(o => o.status === 'PAID').length,
      shipped: orders.filter(o => o.status === 'SHIPPED').length,
      delivered: orders.filter(o => o.status === 'DELIVERED').length,
      cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  const counts = getOrderCounts()
  const filteredOrders = filterOrders(orders, activeTab, searchQuery)

  const renderOrderCard = (order: Order) => (
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
              {order.status === 'PENDING' && (
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                >
                  <Package className="w-4 h-4 mr-1" />
                  Process
                </Button>
              )}
              {order.status === 'PROCESSING' && (
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
                  onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark Delivered
                </Button>
              )}
              {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              )}
              {order.status === 'CANCELLED' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteOrder(order.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground">
          Manage customer orders and update their status
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Order Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({counts.processing})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({counts.paid})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({counts.shipped})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({counts.delivered})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({counts.cancelled})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No orders found matching your search.' : 'No orders found.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map(renderOrderCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
