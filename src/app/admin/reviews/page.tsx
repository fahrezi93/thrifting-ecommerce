'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Star, Trash2, MessageSquare, Reply, Edit, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { apiClient } from '@/lib/api-client'

interface Review {
  id: string
  rating: number
  comment: string | null
  adminReply: string | null
  repliedBy: string | null
  repliedAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
  product: {
    id: string
    name: string
    imageUrls: string
  }
}

interface ReviewsResponse {
  reviews: Review[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function AdminReviewsPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  
  // Filters
  const [filters, setFilters] = useState({
    rating: 'all',
    hasReply: 'all',
    search: ''
  })
  
  // Reply modal state
  const [replyModal, setReplyModal] = useState<{
    isOpen: boolean
    review: Review | null
    replyText: string
    isSubmitting: boolean
  }>({
    isOpen: false,
    review: null,
    replyText: '',
    isSubmitting: false
  })

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchReviews()
    }
  }, [user, pagination.page, filters])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })
      
      if (filters.rating && filters.rating !== 'all') params.append('rating', filters.rating)
      if (filters.hasReply && filters.hasReply !== 'all') params.append('hasReply', filters.hasReply)
      
      const data: ReviewsResponse = await apiClient.get(`/api/admin/reviews?${params}`)
      setReviews(data.reviews)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await apiClient.delete(`/api/admin/reviews?id=${reviewId}`)
      fetchReviews() // Refresh the list
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Failed to delete review')
    }
  }

  const openReplyModal = (review: Review) => {
    setReplyModal({
      isOpen: true,
      review,
      replyText: review.adminReply || '',
      isSubmitting: false
    })
  }

  const closeReplyModal = () => {
    setReplyModal({
      isOpen: false,
      review: null,
      replyText: '',
      isSubmitting: false
    })
  }

  const handleSubmitReply = async () => {
    if (!replyModal.review || !replyModal.replyText.trim()) return

    setReplyModal(prev => ({ ...prev, isSubmitting: true }))

    try {
      const endpoint = replyModal.review.adminReply 
        ? '/api/admin/reviews/reply' // Update existing reply
        : '/api/admin/reviews/reply' // Create new reply
      
      if (replyModal.review.adminReply) {
        // Update existing reply
        await apiClient.put('/api/admin/reviews/reply', {
          reviewId: replyModal.review.id,
          adminReply: replyModal.replyText.trim()
        })
      } else {
        // Create new reply
        await apiClient.post('/api/admin/reviews/reply', {
          reviewId: replyModal.review.id,
          adminReply: replyModal.replyText.trim()
        })
      }

      fetchReviews() // Refresh the list
      closeReplyModal()
    } catch (error) {
      console.error('Error submitting reply:', error)
      alert('Failed to submit reply')
    } finally {
      setReplyModal(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleDeleteReply = async (reviewId: string) => {
    try {
      await apiClient.delete(`/api/admin/reviews/reply?reviewId=${reviewId}`)
      fetchReviews() // Refresh the list
    } catch (error) {
      console.error('Error deleting reply:', error)
      alert('Failed to delete reply')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600'
    if (rating >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const parseImageUrls = (imageUrls: string): string => {
    try {
      const urls = JSON.parse(imageUrls)
      if (Array.isArray(urls) && urls.length > 0) {
        const firstImage = urls[0]
        if (firstImage.startsWith('http') || firstImage.startsWith('https')) {
          return firstImage
        } else if (firstImage.startsWith('/')) {
          return firstImage
        } else {
          return `/uploads/${firstImage}`
        }
      }
    } catch (error) {
      console.error('Error parsing image URLs:', error)
    }
    return '/placeholder-image.jpg'
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Review Management</h1>
        <p className="text-muted-foreground">
          Manage customer reviews and respond to feedback
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <Select value={filters.rating} onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ratings</SelectItem>
                  <SelectItem value="5">5 stars</SelectItem>
                  <SelectItem value="4">4 stars</SelectItem>
                  <SelectItem value="3">3 stars</SelectItem>
                  <SelectItem value="2">2 stars</SelectItem>
                  <SelectItem value="1">1 star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Reply Status</label>
              <Select value={filters.hasReply} onValueChange={(value) => setFilters(prev => ({ ...prev, hasReply: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All reviews" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All reviews</SelectItem>
                  <SelectItem value="true">Replied</SelectItem>
                  <SelectItem value="false">Not replied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reviews..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">Loading reviews...</div>
      ) : (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
                <p className="text-muted-foreground">
                  No reviews match your current filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative h-16 w-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={parseImageUrls(review.product.imageUrls)}
                        alt={review.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-image.jpg'
                        }}
                      />
                    </div>

                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{review.product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {review.user.name} • {formatDate(review.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 ${getRatingColor(review.rating)}`}>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-sm font-medium ml-1">{review.rating}</span>
                          </div>
                          {review.adminReply && (
                            <Badge variant="secondary">Replied</Badge>
                          )}
                        </div>
                      </div>

                      {/* Review Comment */}
                      {review.comment && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm">{review.comment}</p>
                        </div>
                      )}

                      {/* Admin Reply */}
                      {review.adminReply && (
                        <div className="bg-blue-50 p-3 rounded-md border-l-4 border-blue-500">
                          <div className="flex items-center gap-2 mb-2">
                            <Reply className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">Admin Reply</span>
                            <span className="text-xs text-muted-foreground">
                              {review.repliedAt && formatDate(review.repliedAt)}
                            </span>
                          </div>
                          <p className="text-sm">{review.adminReply}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReplyModal(review)}
                        >
                          {review.adminReply ? (
                            <>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Reply
                            </>
                          ) : (
                            <>
                              <Reply className="w-4 h-4 mr-2" />
                              Reply
                            </>
                          )}
                        </Button>

                        {review.adminReply && (
                          <AlertDialog>
                            <AlertDialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Reply
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Reply</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this admin reply? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteReply(review.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Reply
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 px-3 text-xs">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Review
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Review</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this review? This action cannot be undone and will remove the review permanently.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteReview(review.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Review
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reviews
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reply Modal */}
      <Dialog open={replyModal.isOpen} onOpenChange={closeReplyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {replyModal.review?.adminReply ? 'Edit Admin Reply' : 'Reply to Review'}
            </DialogTitle>
            <DialogDescription>
              {replyModal.review?.adminReply 
                ? 'Update your response to this customer review'
                : 'Respond to this customer review professionally'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Original Review */}
            {replyModal.review && (
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (replyModal.review?.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{replyModal.review.user.name}</span>
                </div>
                {replyModal.review.comment && (
                  <p className="text-sm">{replyModal.review.comment}</p>
                )}
              </div>
            )}

            {/* Reply Textarea */}
            <div>
              <label className="text-sm font-medium mb-2 block">Your Reply</label>
              <Textarea
                placeholder="Write a professional response to this review..."
                value={replyModal.replyText}
                onChange={(e) => setReplyModal(prev => ({ ...prev, replyText: e.target.value }))}
                rows={4}
                maxLength={1000}
                disabled={replyModal.isSubmitting}
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {replyModal.replyText.length}/1000 characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={closeReplyModal}
                disabled={replyModal.isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReply}
                disabled={replyModal.isSubmitting || !replyModal.replyText.trim()}
                className="flex-1"
              >
                {replyModal.isSubmitting ? 'Submitting...' : 'Submit Reply'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
