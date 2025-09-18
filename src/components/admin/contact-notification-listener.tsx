'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
// import { toast } from 'sonner' // Will be added when sonner is installed
import { Mail, MessageCircle } from 'lucide-react'
import pusher from '@/lib/pusher-client'

interface ContactNotification {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
  status: string
}

export function ContactNotificationListener() {
  const { user } = useAuth()

  useEffect(() => {
    // Only listen for admin users
    if (!user || user.role !== 'ADMIN') return

    // Subscribe to admin notifications channel
    const channel = pusher.subscribe('admin-notifications')

    // Listen for new contact messages
    channel.bind('new-contact-message', (data: ContactNotification) => {
      // Show browser alert for now (can be replaced with proper toast later)
      if (confirm(`New Contact Message from ${data.name}: "${data.subject}"\n\nClick OK to view in admin panel.`)) {
        window.location.href = '/admin/contact-messages'
      }

      // Play notification sound (optional)
      if (typeof window !== 'undefined' && 'Audio' in window) {
        try {
          const audio = new Audio('/notification.mp3')
          audio.volume = 0.3
          audio.play().catch(() => {
            // Ignore audio play errors (browser restrictions)
          })
        } catch (error) {
          // Ignore audio errors
        }
      }

      // Show browser notification if permission granted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('New Contact Message - Thrift Haven', {
          body: `${data.name} sent: "${data.subject}"`,
          icon: '/favicon.ico',
          tag: `contact-${data.id}`,
          requireInteraction: false
        })
      }
    })

    // Request notification permission on mount
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Cleanup subscription on unmount
    return () => {
      channel.unbind('new-contact-message')
      pusher.unsubscribe('admin-notifications')
    }
  }, [user])

  // This component doesn't render anything
  return null
}
