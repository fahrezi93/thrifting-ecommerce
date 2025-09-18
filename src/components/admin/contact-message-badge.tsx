'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import pusher from '@/lib/pusher-client'

export function ContactMessageBadge() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Only fetch for admin users
    if (!user || user.role !== 'ADMIN') return

    // Fetch initial unread count
    fetchUnreadCount()

    // Subscribe to real-time updates
    const channel = pusher.subscribe('admin-notifications')
    
    channel.bind('new-contact-message', () => {
      setUnreadCount(prev => prev + 1)
    })

    return () => {
      channel.unbind('new-contact-message')
      pusher.unsubscribe('admin-notifications')
    }
  }, [user])

  const fetchUnreadCount = async () => {
    try {
      if (!user?.getIdToken) return
      
      const token = await user.getIdToken()
      const response = await fetch('/api/admin/contact-messages/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count || 0)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  if (unreadCount === 0) return null

  return (
    <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  )
}
