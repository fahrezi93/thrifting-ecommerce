'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Bell, CheckCircle, X } from 'lucide-react'
import { usePushNotifications } from '@/hooks/use-push-notifications'

export function PushNotificationSetup() {
  const { isSupported, isSubscribed, loading, subscribe, unsubscribe } = usePushNotifications()
  const [showModal, setShowModal] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the modal before
    const dismissed = localStorage.getItem('push-notification-dismissed')
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Show modal after 2 seconds if notifications are supported but not subscribed
    if (isSupported && !isSubscribed && !isDismissed) {
      const timer = setTimeout(() => {
        setShowModal(true)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [isSupported, isSubscribed, isDismissed])

  const handleSubscribe = async () => {
    try {
      const success = await subscribe()
      if (success) {
        console.log('Successfully subscribed to push notifications!')
        setShowModal(false)
      }
    } catch (error) {
      console.error('Failed to subscribe:', error)
    }
  }

  const handleDismiss = () => {
    setShowModal(false)
    setIsDismissed(true)
    localStorage.setItem('push-notification-dismissed', 'true')
  }

  // Status indicator for subscribed users (small, non-intrusive)
  if (isSubscribed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-green-100 border border-green-200 rounded-lg p-2 shadow-sm">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Notifications On</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Enable Push Notifications
          </DialogTitle>
          <DialogDescription>
            Get instant notifications about your orders, exclusive deals, and new arrivals directly to your device!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">Stay Updated</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Order status updates</li>
                  <li>• Exclusive promotions</li>
                  <li>• New product arrivals</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleSubscribe}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enabling...
                </div>
              ) : (
                'Enable Notifications'
              )}
            </Button>
            <Button 
              onClick={handleDismiss}
              variant="outline"
            >
              <X className="w-4 h-4 mr-2" />
              Maybe Later
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            You can change this setting anytime in your profile
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
