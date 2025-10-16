import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  size: string
  quantity: number
  stock: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  userId: string | null
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  setUserId: (userId: string | null) => void
  loadUserCart: (userId: string) => void
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      userId: null,
      
      setUserId: (userId) => {
        const currentUserId = get().userId
        const currentItems = get().items
        
        if (currentUserId !== userId) {
          set({ userId })
          
          if (userId) {
            // User logged in - try to merge local cart with server cart
            if (currentItems.length > 0) {
              // If there are items in local cart, keep them
              console.log('Keeping local cart items:', currentItems.length)
            }
            // Load cart from server (will merge if needed)
            get().loadUserCart(userId)
          } else if (currentUserId) {
            // User logged out - clear cart
            set({ items: [] })
          }
          // If currentUserId is null and userId is null, it's initial load - keep cart
        }
      },

      loadUserCart: async (userId) => {
        try {
          const { auth } = await import('@/lib/firebase')
          const currentUser = auth.currentUser

          if (!currentUser) {
            console.log('No current user, skipping cart load')
            return
          }

          const token = await currentUser.getIdToken()
          const response = await fetch(`/api/user/cart`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const { items: serverItems } = await response.json()
            const localItems = get().items
            
            // Merge local cart with server cart
            if (localItems.length > 0 && serverItems && serverItems.length > 0) {
              // Merge: prioritize local cart but add server items that aren't in local
              const mergedItems = [...localItems]
              serverItems.forEach((serverItem: CartItem) => {
                const existsInLocal = localItems.find(item => item.id === serverItem.id)
                if (!existsInLocal) {
                  mergedItems.push(serverItem)
                }
              })
              set({ items: mergedItems })
              console.log('Cart merged:', mergedItems.length, 'items')
              
              // Save merged cart back to server
              try {
                await fetch('/api/user/cart', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({ items: mergedItems }),
                })
              } catch (error) {
                console.error('Error saving merged cart:', error)
              }
            } else if (serverItems && serverItems.length > 0) {
              // Only server has items
              set({ items: serverItems })
              console.log('Cart loaded from server:', serverItems.length, 'items')
            } else if (localItems.length > 0) {
              // Only local has items, save to server
              console.log('Saving local cart to server:', localItems.length, 'items')
              try {
                await fetch('/api/user/cart', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({ items: localItems }),
                })
              } catch (error) {
                console.error('Error saving local cart to server:', error)
              }
            } else {
              // Both empty
              set({ items: [] })
            }
          } else {
            console.error('Failed to load cart:', response.status)
          }
        } catch (error) {
          console.error('Error loading user cart:', error)
        }
      },

      addItem: async (item) => {
        const { userId } = get()
        const items = get().items
        const existingItem = items.find((i) => i.id === item.id)
        
        let newItems
        if (existingItem) {
          newItems = items.map((i) =>
            i.id === item.id
              ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
              : i
          )
        } else {
          newItems = [...items, { ...item, quantity: 1 }]
        }
        
        set({ items: newItems })
        
        // Save to server if user is logged in
        if (userId) {
          try {
            const { auth } = await import('@/lib/firebase')
            const token = await auth.currentUser?.getIdToken()
            await fetch('/api/user/cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ items: newItems }),
            })
          } catch (error) {
            console.error('Error saving cart:', error)
          }
        }
        // If not logged in, cart is saved to localStorage by persist middleware
      },
      
      removeItem: async (id) => {
        const { userId } = get()
        const newItems = get().items.filter((item) => item.id !== id)
        set({ items: newItems })
        
        // Save to server if user is logged in
        if (userId) {
          try {
            const { auth } = await import('@/lib/firebase')
            const token = await auth.currentUser?.getIdToken()
            await fetch('/api/user/cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ items: newItems }),
            })
          } catch (error) {
            console.error('Error saving cart:', error)
          }
        }
        // If not logged in, cart is saved to localStorage by persist middleware
      },
      
      updateQuantity: async (id, quantity) => {
        const { userId } = get()

        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        
        const newItems = get().items.map((item) =>
          item.id === id
            ? { ...item, quantity: Math.min(quantity, item.stock) }
            : item
        )
        
        set({ items: newItems })
        
        // Save to server if user is logged in
        if (userId) {
          try {
            const { auth } = await import('@/lib/firebase')
            const token = await auth.currentUser?.getIdToken()
            await fetch('/api/user/cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ items: newItems }),
            })
          } catch (error) {
            console.error('Error saving cart:', error)
          }
        }
        // If not logged in, cart is saved to localStorage by persist middleware
      },
      
      clearCart: async () => {
        const { userId } = get()
        set({ items: [] })
        
        if (userId) {
          try {
            await fetch('/api/user/cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await (window as any).firebase?.auth()?.currentUser?.getIdToken()}`,
              },
              body: JSON.stringify({ items: [] }),
            })
          } catch (error) {
            console.error('Error clearing cart:', error)
          }
        }
      },
      
      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ 
        isOpen: state.isOpen,
        userId: state.userId,
        items: state.items, // Persist cart items
      }),
    }
  )
)
