'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, BellOff, X } from 'lucide-react'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { useDisplayMode } from '@/hooks/use-display-mode'

export function NotificationPermission() {
  const { isSupported, isSubscribed, loading, subscribe, unsubscribe } = usePushNotifications()
  const { isInstalled } = useDisplayMode()
  const [dismissed, setDismissed] = useState(false)

  // Only show for installed PWA and if notifications are supported
  if (!isInstalled || !isSupported || dismissed || isSubscribed) {
    return null
  }

  const handleSubscribe = async () => {
    const success = await subscribe()
    if (success) {
      // Show success message or toast
      console.log('Successfully subscribed to notifications!')
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    // Store in localStorage to remember dismissal
    localStorage.setItem('notification-permission-dismissed', 'true')
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Enable Notifications
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-3">
            Get notified about exclusive deals, new arrivals, and special promotions!
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handleSubscribe}
              disabled={loading}
              size="sm"
              className="flex-1"
            >
              {loading ? 'Enabling...' : 'Enable Notifications'}
            </Button>
            <Button 
              onClick={handleDismiss}
              variant="outline"
              size="sm"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function NotificationToggle() {
  const { isSupported, isSubscribed, loading, subscribe, unsubscribe } = usePushNotifications()

  if (!isSupported) return null

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        {isSubscribed ? (
          <Bell className="w-5 h-5 text-primary" />
        ) : (
          <BellOff className="w-5 h-5 text-muted-foreground" />
        )}
        <div>
          <h3 className="font-medium">Push Notifications</h3>
          <p className="text-sm text-muted-foreground">
            {isSubscribed ? 'You\'ll receive promo notifications' : 'Enable to get promo alerts'}
          </p>
        </div>
      </div>
      <Button
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={loading}
        variant={isSubscribed ? "outline" : "default"}
        size="sm"
      >
        {loading ? 'Loading...' : isSubscribed ? 'Disable' : 'Enable'}
      </Button>
    </div>
  )
}
