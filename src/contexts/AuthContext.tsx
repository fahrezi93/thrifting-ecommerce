'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { prisma } from '@/lib/prisma'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      // Firebase not available, set loading to false
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Sync user with database using ID token for verification
        try {
          const response = await fetch('/api/auth/sync-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified,
              image: firebaseUser.photoURL
            })
          })
          
          if (!response.ok) {
            console.warn('User sync failed, but continuing with authentication')
          }
        } catch (error) {
          console.error('Error syncing user:', error)
          // Continue with authentication even if sync fails
        }
      }
      setUser(firebaseUser)
      setLoading(false)
      
      // Update cart store with user ID
      try {
        const { useCartStore } = require('@/store/cart')
        useCartStore.getState().setUserId(firebaseUser?.uid || null)
      } catch (error) {
        console.warn('Cart store not available:', error)
      }
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not initialized')
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, name: string) => {
    if (!auth) throw new Error('Firebase not initialized')
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName: name })
  }

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase not initialized')
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const logout = async () => {
    if (!auth) throw new Error('Firebase not initialized')
    await signOut(auth)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
