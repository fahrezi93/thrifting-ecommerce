'use client'

import { useState, useEffect } from 'react'

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()
      
      if (existingSubscription) {
        setSubscription(existingSubscription)
        setIsSubscribed(true)
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const requestPermission = async () => {
    if (!isSupported) return false

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  const subscribe = async () => {
    if (!isSupported) return false

    setLoading(true)
    try {
      const hasPermission = await requestPermission()
      if (!hasPermission) {
        setLoading(false)
        return false
      }

      const registration = await navigator.serviceWorker.ready
      
      // Generate VAPID keys - in production, use your own keys
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
        'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f4uOWoFzQhkTF7A3PBJXfXWPFkXfRBNjMWcbJsxUhcVLRlBOQwU'

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      })

      if (response.ok) {
        setSubscription(subscription)
        setIsSubscribed(true)
        setLoading(false)
        return true
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
    }
    
    setLoading(false)
    return false
  }

  const unsubscribe = async () => {
    if (!subscription) return false

    setLoading(true)
    try {
      await subscription.unsubscribe()
      
      // Remove subscription from server
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      })

      setSubscription(null)
      setIsSubscribed(false)
      setLoading(false)
      return true
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      setLoading(false)
      return false
    }
  }

  return {
    isSupported,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
    requestPermission
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
