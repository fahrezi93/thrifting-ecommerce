// Push Notification Service Worker
console.log('Push Service Worker loaded')

// Listen for push events
self.addEventListener('push', function(event) {
  console.log('Push event received:', event)
  
  let notificationData = {
    title: 'Thrift Haven',
    body: 'You have a new notification!',
    icon: '/Logo-App-Mobile.svg',
    badge: '/Logo-App-Mobile.svg',
    tag: 'thrift-haven-notification',
    data: {
      url: '/'
    }
  }

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json()
      console.log('Push data received:', pushData)
      
      notificationData = {
        title: pushData.title || notificationData.title,
        body: pushData.body || notificationData.body,
        icon: pushData.icon || notificationData.icon,
        badge: pushData.badge || notificationData.badge,
        tag: pushData.tag || notificationData.tag,
        data: {
          url: pushData.url || pushData.data?.url || '/',
          timestamp: Date.now(),
          ...pushData.data
        },
        actions: pushData.actions || [
          {
            action: 'view',
            title: 'View',
            icon: '/Logo-App-Mobile.svg'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ],
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200]
      }
    } catch (error) {
      console.error('Error parsing push data:', error)
    }
  }

  // Show notification
  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      vibrate: notificationData.vibrate,
      renotify: true
    }
  )

  event.waitUntil(promiseChain)
})

// Listen for notification click events
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event)
  
  const notification = event.notification
  const action = event.action
  const data = notification.data || {}

  // Close the notification
  notification.close()

  if (action === 'dismiss') {
    // Just close the notification
    return
  }

  // Default action or 'view' action
  const urlToOpen = data.url || '/'
  
  // Focus existing window or open new one
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then(function(clientList) {
    // Check if there's already a window/tab open with the target URL
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i]
      if (client.url.includes(self.location.origin) && 'focus' in client) {
        // Focus the existing window and navigate to the URL
        client.focus()
        return client.navigate(urlToOpen)
      }
    }
    
    // If no existing window, open a new one
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen)
    }
  })

  event.waitUntil(promiseChain)
})

// Listen for notification close events
self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event)
  
  // Optional: Track notification dismissal
  // You can send analytics data here if needed
})

// Background sync for offline notifications (optional)
self.addEventListener('sync', function(event) {
  console.log('Background sync:', event)
  
  if (event.tag === 'background-notification-sync') {
    // Handle background sync for notifications
    event.waitUntil(
      // You can implement offline notification sync here
      Promise.resolve()
    )
  }
})

console.log('Push Service Worker setup complete')
