import Pusher from 'pusher-js'

// Initialize Pusher client with fallback for missing env vars
const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

let pusherInstance: Pusher

if (pusherKey && pusherCluster) {
  pusherInstance = new Pusher(pusherKey, {
    cluster: pusherCluster,
    forceTLS: true,
  })
} else {
  console.warn('Pusher credentials not configured. Real-time notifications will not work.')
  // Create a mock pusher object for development
  pusherInstance = {
    subscribe: () => ({
      bind: () => {},
      unbind: () => {}
    }),
    unsubscribe: () => {},
    trigger: () => Promise.resolve()
  } as any
}

export default pusherInstance
