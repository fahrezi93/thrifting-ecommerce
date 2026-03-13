'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'

export function useNotificationPermission() {
  const { data: session } = useSession()
  const user = session?.user
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported || !user) return false

    setLoading(true)
    try {
      // Request browser notification permission
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        // Save permission status to user preferences
        try {
          await fetch('/api/user/notification-preferences', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              browserNotifications: true,
              pushNotifications: true
            })
          })
        } catch (error) {
          console.error('Error saving notification preferences:', error)
        }

        // Show a test notification
        new Notification('Notifications Enabled! 🎉', {
          body: 'You\'ll now receive updates about your orders and exclusive deals.',
          icon: '/Logo-App-Mobile.svg',
          badge: '/Logo-App-Mobile.svg'
        })

        setLoading(false)
        return true
      }

      setLoading(false)
      return false
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      setLoading(false)
      return false
    }
  }

  const disableNotifications = async () => {
    if (!user) return false

    setLoading(true)
    try {
      // Save disabled status to user preferences
      await fetch('/api/user/notification-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          browserNotifications: false,
          pushNotifications: false
        })
      })

      setLoading(false)
      return true
    } catch (error) {
      console.error('Error disabling notifications:', error)
      setLoading(false)
      return false
    }
  }

  return {
    isSupported,
    permission,
    isEnabled: permission === 'granted',
    loading,
    requestPermission,
    disableNotifications
  }
}
