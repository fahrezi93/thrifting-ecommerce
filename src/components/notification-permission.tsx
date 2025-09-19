'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, BellOff, X } from 'lucide-react'
import { useNotificationPermission } from '@/hooks/use-notification-permission'
import { useDisplayMode } from '@/hooks/use-display-mode'

export function NotificationPermission() {
  const { isSupported, isEnabled, loading, requestPermission } = useNotificationPermission()
  const { isInstalled } = useDisplayMode()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user previously dismissed this
    const wasDismissed = localStorage.getItem('notification-permission-dismissed')
    if (wasDismissed === 'true') {
      setDismissed(true)
    }
  }, [])

  // Only show for installed PWA and if notifications are supported and not enabled
  if (!isInstalled || !isSupported || dismissed || isEnabled) {
    return null
  }

  const handleEnable = async () => {
    const success = await requestPermission()
    if (success) {
      console.log('Successfully enabled notifications!')
      // Auto-dismiss after successful enable
      setDismissed(true)
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
              onClick={handleEnable}
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
  const { isSupported, isEnabled, loading, requestPermission, disableNotifications } = useNotificationPermission()

  if (!isSupported) return null

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        {isEnabled ? (
          <Bell className="w-5 h-5 text-primary" />
        ) : (
          <BellOff className="w-5 h-5 text-muted-foreground" />
        )}
        <div>
          <h3 className="font-medium">Browser Notifications</h3>
          <p className="text-sm text-muted-foreground">
            {isEnabled ? 'You\'ll receive order and promo notifications' : 'Enable to get instant alerts'}
          </p>
        </div>
      </div>
      <Button
        onClick={isEnabled ? disableNotifications : requestPermission}
        disabled={loading}
        variant={isEnabled ? "outline" : "default"}
        size="sm"
      >
        {loading ? 'Loading...' : isEnabled ? 'Disable' : 'Enable'}
      </Button>
    </div>
  )
}
