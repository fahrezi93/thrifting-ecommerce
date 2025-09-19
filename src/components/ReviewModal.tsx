'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import Image from 'next/image'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  orderItemId: string
  productId: string
  productName: string
  productImage: string
  onReviewSubmitted?: () => void
}

export default function ReviewModal({
  isOpen,
  onClose,
  orderItemId,
  productId,
  productName,
  productImage,
  onReviewSubmitted
}: ReviewModalProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [existingReview, setExistingReview] = useState<any>(null)
  const [hasReview, setHasReview] = useState(false)

  // Check if user already has a review for this order item
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!isOpen || !orderItemId || !user) return
      
      setIsLoading(true)
      try {
        const response = await apiClient.get(`/api/reviews/check?orderItemId=${orderItemId}`)
        setHasReview(response.hasReview)
        setExistingReview(response.review)
        
        if (response.hasReview && response.review) {
          setRating(response.review.rating)
          setComment(response.review.comment || '')
        }
      } catch (error) {
        console.error('Error checking existing review:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingReview()
  }, [isOpen, orderItemId, user])

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to submit a review')
      return
    }

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await apiClient.post('/api/reviews', {
        rating,
        comment: comment.trim() || null,
        productId,
        orderItemId
      })

      // Reset form
      setRating(0)
      setComment('')
      
      // Call callback if provided
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
      
      // Close modal
      onClose()
      
      // Show success message
      alert('Review submitted successfully!')
    } catch (error: any) {
      console.error('Error submitting review:', error)
      setError(error.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0)
      setComment('')
      setError('')
      setExistingReview(null)
      setHasReview(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {hasReview ? 'Your Review' : 'Write a Review'}
          </DialogTitle>
          <DialogDescription>
            {hasReview 
              ? 'You have already reviewed this product'
              : 'Share your experience with this product'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          ) : (
            <>
              {/* Product Info */}
              <div className="flex gap-3 items-center p-3 bg-muted rounded-lg">
                <div className="relative h-16 w-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={productImage}
                    alt={productName}
                    fill
                    className="object-cover"
                    sizes="64px"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-image.jpg'
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{productName}</h4>
                  <p className="text-xs text-muted-foreground">Rate your experience</p>
                </div>
              </div>

              {/* Star Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Rating {!hasReview && '*'}
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`p-1 transition-transform ${
                        hasReview ? 'cursor-default' : 'hover:scale-110 cursor-pointer'
                      }`}
                      onMouseEnter={() => !hasReview && setHoveredRating(star)}
                      onMouseLeave={() => !hasReview && setHoveredRating(0)}
                      onClick={() => !hasReview && setRating(star)}
                      disabled={isSubmitting || hasReview}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Review {!hasReview && '(Optional)'}
                </label>
                <Textarea
                  placeholder={hasReview ? '' : 'Tell others about your experience with this product...'}
                  value={comment}
                  onChange={(e) => !hasReview && setComment(e.target.value)}
                  rows={4}
                  maxLength={500}
                  disabled={isSubmitting || hasReview}
                  readOnly={hasReview}
                />
                {!hasReview && (
                  <p className="text-xs text-muted-foreground text-right">
                    {comment.length}/500 characters
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {hasReview ? 'Close' : 'Cancel'}
                </Button>
                {!hasReview && (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || rating === 0}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </Button>
                )}
              </div>
              
              {hasReview && (
                <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Review submitted on {new Date(existingReview?.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
