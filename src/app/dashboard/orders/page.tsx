'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, Clock, CreditCard, Eye, Star, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import ReviewModal from '@/components/ReviewModal'

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
  hasReview?: boolean
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
  PENDING: { label: 'Pending Payment', icon: Clock, color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200', description: 'Waiting for payment' },
  PAID: { label: 'Payment Confirmed', icon: CheckCircle, color: 'bg-green-100 text-green-800 hover:bg-green-200', description: 'Payment received, preparing order' },
  PROCESSING: { label: 'Processing', icon: Package, color: 'bg-blue-100 text-blue-800 hover:bg-blue-200', description: 'Order is being prepared' },
  SHIPPED: { label: 'Shipped', icon: Truck, color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200', description: 'Order is on the way' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800 hover:bg-green-200', description: 'Order has been delivered' },
  COMPLETED: { label: 'Completed', icon: Package, color: 'bg-purple-100 text-purple-800 hover:bg-purple-200', description: 'Order completed successfully' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800 hover:bg-red-200', description: 'Order was cancelled' },
}

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean
    orderItemId: string
    productId: string
    productName: string
    productImage: string
  }>({
    isOpen: false,
    orderItemId: '',
    productId: '',
    productName: '',
    productImage: ''
  })
  const [reviewStatuses, setReviewStatuses] = useState<{[key: string]: boolean}>({})

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
        // Check review status for delivered orders
        await checkReviewStatuses(data)
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

  const checkReviewStatuses = async (orders: Order[]) => {
    const statuses: {[key: string]: boolean} = {}
    
    for (const order of orders) {
      if (order.status === 'DELIVERED') {
        for (const item of order.orderItems) {
          try {
            const response = await apiClient.get(`/api/reviews/check?orderItemId=${item.id}`)
            statuses[item.id] = response.hasReview
          } catch (error) {
            console.error('Error checking review status:', error)
            statuses[item.id] = false
          }
        }
      }
    }
    
    setReviewStatuses(statuses)
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
          toast.success(`Order status successfully updated from ${responseData.oldStatus} to ${responseData.newStatus}!`);
        } else {
          toast.info(`Order status is still ${responseData.currentStatus}. DOKU status: ${responseData.dokuStatus || 'Unknown'}`);
        }
      } else {
        console.error('Failed to check payment status:', responseData);
        toast.error(`Failed to check status: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        toast.success(`Order status successfully updated to ${status}!`);
      } else {
        console.error('Failed to update order status:', responseData);
        toast.error(`Failed to update status: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const openReviewModal = (orderItemId: string, productId: string, productName: string, productImage: string) => {
    setReviewModal({
      isOpen: true,
      orderItemId,
      productId,
      productName,
      productImage
    })
  }

  const closeReviewModal = () => {
    setReviewModal({
      isOpen: false,
      orderItemId: '',
      productId: '',
      productName: '',
      productImage: ''
    })
  }

  const handleReviewSubmitted = () => {
    // Refresh orders and review statuses
    fetchOrders()
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
            const itemCount = order.orderItems.length

            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                      <CardDescription className="mt-1">
                        {formatDate(order.createdAt)} • {itemCount} item{itemCount > 1 ? 's' : ''}
                      </CardDescription>
                      <div className="mt-2">
                        <Badge variant="custom" className={`${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatPrice(order.totalAmount)}</div>
                      <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Order Items Preview - Show first 3 items */}
                  <div className="space-y-2 mb-4">
                    {order.orderItems.slice(0, 3).map((item) => {
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
                          if (firstImage.startsWith('http') || firstImage.startsWith('https')) {
                            imageUrl = firstImage
                          } else if (firstImage.startsWith('/')) {
                            imageUrl = firstImage
                          } else {
                            imageUrl = `/uploads/${firstImage}`
                          }
                        }
                      }

                      return (
                        <div key={item.id} className="flex gap-3 items-center">
                          <div className="relative h-12 w-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                            <Image
                              src={imageUrl}
                              alt={item.product.name || 'Product image'}
                              fill
                              className="object-cover"
                              sizes="48px"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/placeholder-image.jpg'
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              Size: {item.product.size} • Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-sm font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      )
                    })}
                    {order.orderItems.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        +{order.orderItems.length - 3} more item{order.orderItems.length - 3 > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                    {/* View Details Button */}
                    <Link href={`/dashboard/orders/${order.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>

                    {/* Pay Now Button - Only show for pending orders */}
                    {order.status === 'PENDING' && (
                      <Button 
                        className="flex-1"
                        onClick={() => window.location.href = `/payment/instructions?orderId=${order.id}`}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now
                      </Button>
                    )}

                    {/* Check Payment Status Button */}
                    {order.status === 'PENDING' && (
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => checkPaymentStatus(order.orderNumber)}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Check Status
                      </Button>
                    )}

                    {/* Review Products Button - Only show for delivered orders */}
                    {order.status === 'DELIVERED' && (
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          // Open review modal for first unreviewed product or first product
                          const unreviewed = order.orderItems.find(item => !reviewStatuses[item.id])
                          const targetProduct = unreviewed || order.orderItems[0]
                          
                          if (targetProduct) {
                            // Parse imageUrls for target product
                            let imageUrls: string[] = []
                            try {
                              if (targetProduct.product.imageUrls) {
                                if (typeof targetProduct.product.imageUrls === 'string') {
                                  imageUrls = JSON.parse(targetProduct.product.imageUrls)
                                } else if (Array.isArray(targetProduct.product.imageUrls)) {
                                  imageUrls = targetProduct.product.imageUrls
                                }
                              }
                            } catch (error) {
                              console.error('Error parsing imageUrls:', error)
                              imageUrls = []
                            }
                            
                            let imageUrl = '/placeholder-image.jpg'
                            if (imageUrls.length > 0) {
                              const firstImage = imageUrls[0]
                              if (firstImage && typeof firstImage === 'string' && firstImage.trim() !== '') {
                                if (firstImage.startsWith('http') || firstImage.startsWith('https')) {
                                  imageUrl = firstImage
                                } else if (firstImage.startsWith('/')) {
                                  imageUrl = firstImage
                                } else {
                                  imageUrl = `/uploads/${firstImage}`
                                }
                              }
                            }
                            
                            openReviewModal(
                              targetProduct.id,
                              targetProduct.product.id,
                              targetProduct.product.name,
                              imageUrl
                            )
                          }
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {order.orderItems.some(item => !reviewStatuses[item.id]) ? 'Write Reviews' : 'View Reviews'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      
      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={closeReviewModal}
        orderItemId={reviewModal.orderItemId}
        productId={reviewModal.productId}
        productName={reviewModal.productName}
        productImage={reviewModal.productImage}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  )
}
