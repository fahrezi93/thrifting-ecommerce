'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, BellOff, X, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useDisplayMode } from '@/hooks/use-display-mode'

export function SimpleNotificationPermission() {
  const { user } = useAuth()
  const { isInstalled } = useDisplayMode()
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }

    // Check if user previously dismissed this
    const wasDismissed = localStorage.getItem('notification-permission-dismissed')
    if (wasDismissed === 'true') {
      setDismissed(true)
    }
  }, [])

  // Only show for installed PWA and if notifications are supported and not granted
  if (!isInstalled || !isSupported || dismissed || permission === 'granted' || !user) {
    return null
  }

  const handleEnable = async () => {
    setLoading(true)
    
    try {
      // Request browser notification permission - this is fast
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        // Show immediate success notification
        new Notification('🎉 Notifications Enabled!', {
          body: 'You\'ll now receive updates about your orders and exclusive deals.',
          icon: '/Logo-App-Mobile.svg',
          badge: '/Logo-App-Mobile.svg'
        })
        
        // Auto-dismiss the permission card
        setTimeout(() => {
          setDismissed(true)
          localStorage.setItem('notification-permission-dismissed', 'true')
        }, 1000)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('notification-permission-dismissed', 'true')
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="shadow-lg border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary animate-pulse" />
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
            Get instant alerts for order updates, exclusive deals, and new arrivals! 🛍️
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
                  Enabling...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Bell className="w-3 h-3" />
                  Enable Now
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

export function SimpleNotificationToggle() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  if (!isSupported) return null

  const handleToggle = async () => {
    if (permission === 'granted') {
      // Can't actually disable browser notifications, just show info
      alert('To disable notifications, please use your browser settings.')
      return
    }

    setLoading(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        new Notification('Notifications Enabled! 🎉', {
          body: 'You\'ll now receive order and promo notifications.',
          icon: '/Logo-App-Mobile.svg'
        })
      }
    } catch (error) {
      console.error('Error toggling notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        {permission === 'granted' ? (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <Bell className="w-5 h-5 text-primary" />
          </div>
        ) : (
          <BellOff className="w-5 h-5 text-muted-foreground" />
        )}
        <div>
          <h3 className="font-medium">Browser Notifications</h3>
          <p className="text-sm text-muted-foreground">
            {permission === 'granted' 
              ? 'You\'ll receive instant order and promo alerts' 
              : 'Enable to get instant notifications'}
          </p>
        </div>
      </div>
      <Button
        onClick={handleToggle}
        disabled={loading}
        variant={permission === 'granted' ? "outline" : "default"}
        size="sm"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : permission === 'granted' ? (
          'Enabled'
        ) : (
          'Enable'
        )}
      </Button>
    </div>
  )
}
