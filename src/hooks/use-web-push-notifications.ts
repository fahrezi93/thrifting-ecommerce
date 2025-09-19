'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function useWebPushNotifications() {
  const { user } = useAuth()
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
      checkExistingSubscription()
    }
  }, [])

  const checkExistingSubscription = async () => {
    try {
      // Register service worker if not already registered
      const registration = await navigator.serviceWorker.register('/push-sw.js', {
        scope: '/'
      })
      
      console.log('Service Worker registered:', registration)
      
      // Check for existing subscription
      const existingSubscription = await registration.pushManager.getSubscription()
      if (existingSubscription) {
        setSubscription(existingSubscription)
        console.log('Existing subscription found:', existingSubscription)
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const requestPermissionAndSubscribe = async () => {
    if (!isSupported || !user) {
      console.log('Push notifications not supported or user not logged in')
      return false
    }

    setLoading(true)
    
    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      setPermission(permission)
      
      if (permission !== 'granted') {
        console.log('Notification permission denied')
        setLoading(false)
        return false
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready
      console.log('Service Worker ready:', registration)

      // Check if already subscribed
      let pushSubscription = await registration.pushManager.getSubscription()
      
      if (!pushSubscription) {
        // Create new subscription
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
          'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f4uOWoFzQhkTF7A3PBJXfXWPFkXfRBNjMWcbJsxUhcVLRlBOQwU'

        pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        })
        
        console.log('New push subscription created:', pushSubscription)
      }

      // Send subscription to server
      if (!user?.getIdToken) {
        throw new Error('User getIdToken method not available')
      }
      
      const token = await user.getIdToken()
      if (!token) {
        throw new Error('Unable to get user token')
      }

      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription: pushSubscription.toJSON(),
          userId: user.id
        })
      })

      if (response.ok) {
        setSubscription(pushSubscription)
        
        // Show test notification
        await registration.showNotification('🎉 Push Notifications Enabled!', {
          body: 'You\'ll now receive notifications even when the app is closed.',
          icon: '/Logo-App-Mobile.svg',
          badge: '/Logo-App-Mobile.svg',
          tag: 'test-notification',
          data: { url: '/' },
          requireInteraction: false
        })
        
        setLoading(false)
        return true
      } else {
        throw new Error('Failed to save subscription to server')
      }
    } catch (error) {
      console.error('Error setting up push notifications:', error)
      setLoading(false)
      return false
    }
  }

  const unsubscribe = async () => {
    if (!subscription) return false

    setLoading(true)
    try {
      // Unsubscribe from push manager
      await subscription.unsubscribe()
      
      // Remove from server
      if (user?.getIdToken) {
        const token = await user.getIdToken()
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint
          })
        })
      }

      setSubscription(null)
      setLoading(false)
      return true
    } catch (error) {
      console.error('Error unsubscribing:', error)
      setLoading(false)
      return false
    }
  }

  const sendTestNotification = async () => {
    if (!subscription || !user) return false

    try {
      if (!user?.getIdToken) {
        return false
      }
      
      const token = await user.getIdToken()
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: '🧪 Test Notification',
          body: 'This is a test push notification from Thrift Haven!',
          url: '/dashboard',
          icon: '/Logo-App-Mobile.svg'
        })
      })

      return response.ok
    } catch (error) {
      console.error('Error sending test notification:', error)
      return false
    }
  }

  return {
    isSupported,
    permission,
    isSubscribed: !!subscription,
    loading,
    requestPermissionAndSubscribe,
    unsubscribe,
    sendTestNotification
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
