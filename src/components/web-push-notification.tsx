'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, BellOff, X, CheckCircle, Smartphone } from 'lucide-react'
import { useWebPushNotifications } from '@/hooks/use-web-push-notifications'
import { useDisplayMode } from '@/hooks/use-display-mode'

export function WebPushNotificationPermission() {
  const { 
    isSupported, 
    permission, 
    isSubscribed, 
    loading, 
    requestPermissionAndSubscribe,
    sendTestNotification
  } = useWebPushNotifications()
  
  const { isInstalled } = useDisplayMode()
  const [dismissed, setDismissed] = useState(false)
  const [testLoading, setTestLoading] = useState(false)

  useEffect(() => {
    const wasDismissed = localStorage.getItem('web-push-permission-dismissed')
    if (wasDismissed === 'true') {
      setDismissed(true)
    }
  }, [])

  // Only show for installed PWA and if notifications are supported and not subscribed
  if (!isInstalled || !isSupported || dismissed || isSubscribed) {
    return null
  }

  const handleEnable = async () => {
    const success = await requestPermissionAndSubscribe()
    if (success) {
      console.log('Web Push notifications enabled!')
      setTimeout(() => {
        setDismissed(true)
        localStorage.setItem('web-push-permission-dismissed', 'true')
      }, 2000)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('web-push-permission-dismissed', 'true')
  }

  const handleTestNotification = async () => {
    setTestLoading(true)
    const success = await sendTestNotification()
    if (success) {
      console.log('Test notification sent!')
    }
    setTestLoading(false)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="shadow-lg border-2 border-primary/20 bg-gradient-to-r from-blue-50 to-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Smartphone className="w-4 h-4 text-blue-500" />
                <Bell className="w-4 h-4 text-primary animate-pulse" />
              </div>
              Enable Push Notifications
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
            📱 Get notifications on your phone even when the app is closed! Perfect for order updates and exclusive deals.
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handleEnable}
              disabled={loading}
              size="sm"
              className="flex-1 relative"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Setting up...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3 h-3" />
                  Enable Push
                </div>
              )}
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

export function WebPushNotificationToggle() {
  const { 
    isSupported, 
    permission, 
    isSubscribed, 
    loading, 
    requestPermissionAndSubscribe,
    unsubscribe,
    sendTestNotification
  } = useWebPushNotifications()
  
  const [testLoading, setTestLoading] = useState(false)

  if (!isSupported) return null

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe()
    } else {
      await requestPermissionAndSubscribe()
    }
  }

  const handleTestNotification = async () => {
    setTestLoading(true)
    const success = await sendTestNotification()
    if (success) {
      console.log('Test notification sent to your phone!')
    }
    setTestLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <Smartphone className="w-5 h-5 text-blue-500" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <BellOff className="w-5 h-5 text-muted-foreground" />
              <Smartphone className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <h3 className="font-medium">Push Notifications</h3>
            <p className="text-sm text-muted-foreground">
              {isSubscribed 
                ? '📱 You\'ll receive notifications on your phone' 
                : '📱 Enable to get notifications on your phone'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleToggle}
          disabled={loading}
          variant={isSubscribed ? "outline" : "default"}
          size="sm"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          ) : isSubscribed ? (
            'Disable'
          ) : (
            'Enable'
          )}
        </Button>
      </div>
      
      {isSubscribed && (
        <div className="p-4 border rounded-lg bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-green-800">Push Notifications Active</h4>
              <p className="text-sm text-green-600">
                Test your notifications to make sure they work
              </p>
            </div>
            <Button
              onClick={handleTestNotification}
              disabled={testLoading}
              variant="outline"
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              {testLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                'Test Notification'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
