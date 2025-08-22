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

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      userId: null,
      
      setUserId: (userId) => {
        const currentUserId = get().userId
        if (currentUserId !== userId) {
          // Clear cart when switching users
          set({ userId, items: [] })
          if (userId) {
            get().loadUserCart(userId)
          }
        }
      },

      loadUserCart: async (userId) => {
        try {
          // Load cart from server for this user
          const response = await fetch(`/api/user/cart`, {
            headers: {
              'Authorization': `Bearer ${await (window as any).firebase?.auth()?.currentUser?.getIdToken()}`,
            },
          })
          
          if (response.ok) {
            const { items } = await response.json()
            set({ items: items || [] })
          }
        } catch (error) {
          console.error('Error loading user cart:', error)
        }
      },

      addItem: async (item) => {
        const { userId } = get()
        if (!userId) return

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
        
        // Save to server
        try {
          await fetch('/api/user/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await (window as any).firebase?.auth()?.currentUser?.getIdToken()}`,
            },
            body: JSON.stringify({ items: newItems }),
          })
        } catch (error) {
          console.error('Error saving cart:', error)
        }
      },
      
      removeItem: async (id) => {
        const { userId } = get()
        if (!userId) return

        const newItems = get().items.filter((item) => item.id !== id)
        set({ items: newItems })
        
        // Save to server
        try {
          await fetch('/api/user/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await (window as any).firebase?.auth()?.currentUser?.getIdToken()}`,
            },
            body: JSON.stringify({ items: newItems }),
          })
        } catch (error) {
          console.error('Error saving cart:', error)
        }
      },
      
      updateQuantity: async (id, quantity) => {
        const { userId } = get()
        if (!userId) return

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
        
        // Save to server
        try {
          await fetch('/api/user/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await (window as any).firebase?.auth()?.currentUser?.getIdToken()}`,
            },
            body: JSON.stringify({ items: newItems }),
          })
        } catch (error) {
          console.error('Error saving cart:', error)
        }
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
        set({ isOpen: !get().isOpen })
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
        // Don't persist items in localStorage, load from server
      }),
    }
  )
)
