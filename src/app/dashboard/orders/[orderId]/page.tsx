'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Package, MapPin, CreditCard, Clock, Truck, CheckCircle, Star, XCircle, User } from 'lucide-react'
import ReviewForm from '@/components/reviews/review-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

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
  PENDING: { label: 'Pending Payment', icon: Clock, color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200', description: 'Waiting for payment' },
  PAID: { label: 'Payment Confirmed', icon: CheckCircle, color: 'bg-green-100 text-green-800 hover:bg-green-200', description: 'Payment received, preparing order' },
  PROCESSING: { label: 'Processing', icon: Package, color: 'bg-blue-100 text-blue-800 hover:bg-blue-200', description: 'Order is being prepared' },
  SHIPPED: { label: 'Shipped', icon: Truck, color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200', description: 'Order is on the way' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800 hover:bg-green-200', description: 'Order has been delivered' },
  COMPLETED: { label: 'Completed', icon: Package, color: 'bg-purple-100 text-purple-800 hover:bg-purple-200', description: 'Order completed successfully' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800 hover:bg-red-200', description: 'Order was cancelled' },
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewingItem, setReviewingItem] = useState<OrderItem | null>(null)
  const [reviewableItems, setReviewableItems] = useState<any[]>([])

  const orderId = params.orderId as string

  useEffect(() => {
    if (user && orderId) {
      fetchOrder()
      fetchReviewableItems()
    }
  }, [user, orderId])

  const fetchOrder = async () => {
    try {
      if (!user) {
        setError('Please log in to view order details')
        setLoading(false)
        return
      }
      
      const data = await apiClient.get(`/api/user/orders/${orderId}`)
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviewableItems = async () => {
    try {
      const data = await apiClient.get(`/api/user/orders/${orderId}/reviews`)
      setReviewableItems(data.items || [])
    } catch (error) {
      console.error('Error fetching reviewable items:', error)
    }
  }

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!reviewingItem) return

    try {
      await apiClient.post('/api/reviews', {
        rating,
        comment,
        productId: reviewingItem.product.id,
        orderItemId: reviewingItem.id
      })

      // Refresh reviewable items
      await fetchReviewableItems()
      
      // Close review form
      setShowReviewForm(false)
      setReviewingItem(null)
      
      toast.success('Review submitted successfully!')
    } catch (error) {
      console.error('Error submitting review:', error)
      throw error
    }
  }

  const openReviewForm = (item: OrderItem) => {
    setReviewingItem(item)
    setShowReviewForm(true)
  }

  const handleCheckPaymentStatus = async () => {
    try {
      setLoading(true)
      const response = await apiClient.post('/api/payment/check-status', {
        orderId: order?.id
      })
      
      if (response.status === 'PAID') {
        // Refresh order data
        await fetchOrder()
        toast.success('Payment confirmed! Your order status has been updated.')
      } else {
        toast.info('Payment is still pending. Please try again later or contact support.')
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
      toast.error('Failed to check payment status. Please try again.')
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/orders')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        
        <Card>
          <CardContent className="text-center py-12">
            <XCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error || 'The order you are looking for does not exist or you do not have permission to view it.'}
            </p>
            <Button onClick={() => router.push('/dashboard/orders')}>
              View All Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
  const StatusIcon = statusInfo.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/orders')}
            className="self-start"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Orders</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <Badge variant="custom" className={`${statusInfo.color} px-3 py-2 self-start sm:self-auto`}>
          <StatusIcon className="w-4 h-4 mr-2" />
          {statusInfo.label}
        </Badge>
      </div>

      {/* Order Status Timeline */}
      {(order.status === 'PAID' || order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Order Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`flex items-start space-x-4 ${['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-4 h-4 rounded-full mt-1 ${['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base">Payment Confirmed</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Your payment has been received and confirmed</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:hidden">{formatDate(order.createdAt)}</p>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{formatDate(order.createdAt)}</p>
              </div>
              
              <div className={`flex items-start space-x-4 ${['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-4 h-4 rounded-full mt-1 ${['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base">Processing</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Your order is being prepared for shipment</p>
                  {order.status === 'PROCESSING' && <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:hidden">{formatDate(order.updatedAt)}</p>}
                </div>
                {order.status === 'PROCESSING' && <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{formatDate(order.updatedAt)}</p>}
              </div>
              
              <div className={`flex items-start space-x-4 ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-4 h-4 rounded-full mt-1 ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base">Shipped</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Your order is on the way to you</p>
                  {order.status === 'SHIPPED' && <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:hidden">{formatDate(order.updatedAt)}</p>}
                </div>
                {order.status === 'SHIPPED' && <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{formatDate(order.updatedAt)}</p>}
              </div>
              
              <div className={`flex items-start space-x-4 ${order.status === 'DELIVERED' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-4 h-4 rounded-full mt-1 ${order.status === 'DELIVERED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base">Delivered</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Your order has been successfully delivered</p>
                  {order.status === 'DELIVERED' && <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:hidden">{formatDate(order.updatedAt)}</p>}
                </div>
                {order.status === 'DELIVERED' && <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{formatDate(order.updatedAt)}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Order Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                <div key={item.id} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-muted rounded-lg">
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={item.product.name || 'Product image'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 64px, 80px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-image.jpg'
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base sm:text-lg truncate">{item.product.name}</h4>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Size: {item.product.size} • Qty: {item.quantity}
                    </p>
                    <p className="font-semibold text-base sm:text-lg mt-1 sm:mt-2">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Review Section for Delivered Orders */}
      {order.status === 'DELIVERED' && reviewableItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Rate Your Products</span>
            </CardTitle>
            <CardDescription>
              How satisfied are you with your products? Your feedback helps other customers make better decisions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviewableItems.map((item) => {
                const parseImageUrls = (imageUrls: string): string[] => {
                  try {
                    return JSON.parse(imageUrls)
                  } catch {
                    return [imageUrls]
                  }
                }

                const images = parseImageUrls(item.product.imageUrls)
                let imageUrl = '/placeholder-image.jpg'
                
                if (images && images.length > 0) {
                  const firstImage = images[0]
                  if (firstImage) {
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
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-16 w-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={item.product.name || 'Product image'}
                          fill
                          className="object-cover"
                          sizes="64px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder-image.jpg'
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} • {formatPrice(item.price)}
                        </p>
                        {item.hasReview && item.review && (
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= item.review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-green-600">Reviewed</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      {item.hasReview ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Star className="w-3 h-3 mr-1" />
                          Reviewed
                        </Badge>
                      ) : (
                        <Button
                          onClick={() => openReviewForm(item)}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Star className="w-4 h-4" />
                          <span>Rate Product</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Shipping Address</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold">{order.shippingAddress.name}</p>
              <p className="text-muted-foreground">{order.shippingAddress.street}</p>
              <p className="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="text-muted-foreground">{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p className="text-muted-foreground">Phone: {order.shippingAddress.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Order Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(order.totalAmount - order.shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {order.status === 'PENDING' && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Complete Your Payment</h3>
              <p className="text-muted-foreground mb-4">
                Your order is waiting for payment. Click below to complete your purchase.
              </p>
              <div className="space-y-3">
                <Button 
                  className="w-full md:w-auto"
                  onClick={() => window.location.href = `/payment/custom?orderId=${order.orderNumber}`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now
                </Button>
                <div className="text-sm text-muted-foreground">
                  Already paid? 
                  <Button
                    variant="link"
                    className="p-0 ml-1 h-auto"
                    onClick={handleCheckPaymentStatus}
                  >
                    Check Payment Status
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Form Modal */}
      {showReviewForm && reviewingItem && (
        <ReviewForm
          productId={reviewingItem.product.id}
          orderItemId={reviewingItem.id}
          productName={reviewingItem.product.name}
          productImage={JSON.stringify(reviewingItem.product.imageUrls)}
          onSubmit={handleReviewSubmit}
          onCancel={() => {
            setShowReviewForm(false)
            setReviewingItem(null)
          }}
        />
      )}
    </div>
  )
}
