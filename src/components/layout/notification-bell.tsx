// src/components/layout/notification-bell.tsx
'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Pusher from 'pusher-js';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  url?: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Ambil notifikasi awal
    fetchNotifications();

    // Setup Pusher hanya jika environment variables ada
    if (process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      let pusher: Pusher | null = null;
      let channel: any = null;

      try {
        pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        });

        // Subscribe ke channel khusus user
        channel = pusher.subscribe(`user-${user.id}`);

        // Listen untuk notifikasi baru
        channel.bind('notification', (newNotification: Notification) => {
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        });
      } catch (error) {
        // Silently handle Pusher initialization errors
      }

      // Cleanup
      return () => {
        if (pusher && channel) {
          try {
            // Check connection state before attempting cleanup
            if (pusher.connection.state !== 'disconnected' && pusher.connection.state !== 'disconnecting') {
              channel.unbind_all();
              pusher.unsubscribe(`user-${user.id}`);
            }
            
            // Only disconnect if not already disconnecting/disconnected
            if (pusher.connection.state === 'connected' || pusher.connection.state === 'connecting') {
              pusher.disconnect();
            }
          } catch (error) {
            // Silently handle cleanup errors
          }
        }
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await apiClient.get('/api/notifications');
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch('/api/notifications', {
        notificationId,
        isRead: true
      });
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      
      for (const id of unreadIds) {
        await apiClient.patch('/api/notifications', {
          notificationId: id,
          isRead: true
        });
      }
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Always mark as read when clicked, regardless of current status
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    // Close dropdown first for better UX
    setIsOpen(false);
    
    // Navigate after a short delay to ensure dropdown closes
    if (notification.url && notification.url.trim() !== '') {
      setTimeout(() => {
        window.location.href = notification.url!;
      }, 100);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-7 px-2"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${
                  !notification.isRead ? 'bg-muted/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm ${
                        !notification.isRead ? 'font-semibold' : 'font-medium'
                      }`}>
                        {notification.title}
                      </p>
                      <p className={`text-xs text-muted-foreground ${
                        !notification.isRead ? 'font-medium' : 'font-normal'
                      }`}>
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      notification.type === 'promo' ? 'bg-green-100 text-green-700' :
                      notification.type === 'order' ? 'bg-blue-100 text-blue-700' :
                      notification.type === 'info' ? 'bg-gray-100 text-gray-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {notification.type}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
