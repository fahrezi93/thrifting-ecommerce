'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react'
import Image from 'next/image'
import { apiClient } from '@/lib/api-client'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    imageUrls: string[]
    size: string
  }
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  shippingCost: number
  status: string
  createdAt: string
  updatedAt: string
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    phone?: string
  }
  orderItems: OrderItem[]
}

const statusConfig = {
  PENDING: { label: 'Pending Payment', icon: Clock, color: 'bg-yellow-100 text-yellow-800', description: 'Waiting for payment' },
  PAID: { label: 'Payment Confirmed', icon: CheckCircle, color: 'bg-green-100 text-green-800', description: 'Payment received, preparing order' },
  PROCESSING: { label: 'Processing', icon: Package, color: 'bg-blue-100 text-blue-800', description: 'Order is being prepared' },
  SHIPPED: { label: 'Shipped', icon: Truck, color: 'bg-indigo-100 text-indigo-800', description: 'Order is on the way' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800', description: 'Order has been delivered' },
  COMPLETED: { label: 'Completed', icon: Package, color: 'bg-purple-100 text-purple-800', description: 'Order completed successfully' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800', description: 'Order was cancelled' },
}

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchOrders()
    
    // Check for success/pending messages
    if (searchParams.get('success')) {
      setMessage('Payment successful! Your order has been placed.')
    } else if (searchParams.get('pending')) {
      setMessage('Payment is being processed. You will receive a confirmation once completed.')
    }
  }, [searchParams])

  useEffect(() => {
    // Auto-refresh every 30 seconds to check for status updates
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      if (!user) {
        setLoading(false)
        return
      }
      
      const data = await apiClient.get('/api/user/orders')
      // Validate that data is an array and not an error object
      if (Array.isArray(data)) {
        setOrders(data)
      } else {
        console.error('Invalid data format received:', data)
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  const checkPaymentStatus = async (orderNumber: string) => {
    try {
      console.log('Checking payment status for order:', orderNumber);
      
      const response = await fetch(`/api/orders/${orderNumber}/poll-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderNumber
        }),
      });

      const responseData = await response.json();
      console.log('Payment status check response:', responseData);

      if (response.ok) {
        if (responseData.statusUpdated) {
          // Refresh orders list
          fetchOrders();
          alert(`Status order berhasil diupdate dari ${responseData.oldStatus} ke ${responseData.newStatus}!`);
        } else {
          alert(`Status order masih ${responseData.currentStatus}. DOKU status: ${responseData.dokuStatus || 'Unknown'}`);
        }
      } else {
        console.error('Failed to check payment status:', responseData);
        alert(`Gagal check status: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const updateOrderStatus = async (orderNumber: string, status: string) => {
    try {
      console.log('Updating order status:', { orderNumber, status });
      
      const response = await fetch(`/api/orders/${orderNumber}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderNumber,
          status: status
        }),
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (response.ok) {
        // Refresh orders list
        fetchOrders();
        console.log(`Order ${orderNumber} status updated to ${status}`);
        alert(`Order status berhasil diupdate ke ${status}!`);
      } else {
        console.error('Failed to update order status:', responseData);
        alert(`Gagal update status: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <div>Loading orders...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Order History</h1>
        <p className="text-muted-foreground">
          Track your orders and view purchase history
        </p>
      </div>

      {message && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-green-800">{message}</p>
          </CardContent>
        </Card>
      )}

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">
              Start shopping to see your orders here
            </p>
            <Button onClick={() => window.location.href = '/products'}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
            const StatusIcon = statusInfo.icon

            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                      <CardDescription>
                        Placed on {formatDate(order.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge className={`${statusInfo.color} mb-2`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{statusInfo.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.orderItems.map((item) => {
                      // Parse imageUrls JSON string
                      let imageUrls: string[] = []
                      try {
                        if (item.product.imageUrls) {
                          if (typeof item.product.imageUrls === 'string') {
                            imageUrls = JSON.parse(item.product.imageUrls)
                          } else if (Array.isArray(item.product.imageUrls)) {
                            imageUrls = item.product.imageUrls
                          }
                        }
                      } catch (error) {
                        console.error('Error parsing imageUrls:', error)
                        imageUrls = []
                      }
                      
                      // Get the first image URL or use placeholder
                      let imageUrl = '/placeholder-image.jpg'
                      
                      if (imageUrls.length > 0) {
                        const firstImage = imageUrls[0]
                        if (firstImage && typeof firstImage === 'string' && firstImage.trim() !== '') {
                          // Handle different URL formats
                          if (firstImage.startsWith('http') || firstImage.startsWith('https')) {
                            imageUrl = firstImage
                          } else if (firstImage.startsWith('/')) {
                            imageUrl = firstImage
                          } else {
                            // Assume it's a relative path and make it absolute
                            imageUrl = `/uploads/${firstImage}`
                          }
                        }
                      }

                      return (
                        <div key={item.id} className="flex gap-4 p-3 bg-muted rounded-lg">
                          <div className="relative h-16 w-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                            <Image
                              src={imageUrl}
                              alt={item.product.name || 'Product image'}
                              fill
                              className="object-cover"
                              sizes="64px"
                              onError={(e) => {
                                console.error('Image failed to load:', imageUrl)
                                const target = e.target as HTMLImageElement
                                target.src = '/placeholder-image.jpg'
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully:', imageUrl)
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Size: {item.product.size} • Qty: {item.quantity}
                            </p>
                            <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Shipping Address */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Shipping Address</h4>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                      {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatPrice(order.totalAmount - order.shippingCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>{formatPrice(order.shippingCost)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base">
                          <span>Total:</span>
                          <span>{formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Pay Now Button - Only show for pending orders */}
                    {order.status === 'PENDING' && (
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          className="w-full"
                          onClick={() => window.location.href = `/payment/custom?orderId=${order.orderNumber}`}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Now
                        </Button>
                      </div>
                    )}
                    
                    {/* Order Status Timeline */}
                    {(order.status === 'PAID' || order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold mb-3">Order Status</h4>
                        <div className="space-y-3">
                          <div className={`flex items-center space-x-3 ${['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-3 h-3 rounded-full ${['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div>
                              <p className="font-medium">Payment Confirmed</p>
                              <p className="text-xs text-muted-foreground">Your payment has been received</p>
                            </div>
                          </div>
                          <div className={`flex items-center space-x-3 ${['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-3 h-3 rounded-full ${['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                            <div>
                              <p className="font-medium">Processing</p>
                              <p className="text-xs text-muted-foreground">Order is being prepared</p>
                            </div>
                          </div>
                          <div className={`flex items-center space-x-3 ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-indigo-600' : 'text-gray-400'}`}>
                            <div className={`w-3 h-3 rounded-full ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                            <div>
                              <p className="font-medium">Shipped</p>
                              <p className="text-xs text-muted-foreground">Order is on the way</p>
                            </div>
                          </div>
                          <div className={`flex items-center space-x-3 ${order.status === 'DELIVERED' ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-3 h-3 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div>
                              <p className="font-medium">Delivered</p>
                              <p className="text-xs text-muted-foreground">Order has been delivered</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Check Payment Status Button */}
                    {order.status === 'PENDING' && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">If you have paid but status hasn't updated:</p>
                          <div className="space-y-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => checkPaymentStatus(order.orderNumber)}
                              className="w-full"
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Check Payment Status
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => updateOrderStatus(order.orderNumber, 'PAID')}
                              className="w-full"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Paid (Manual)
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
