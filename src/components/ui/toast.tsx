"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: 'default' | 'destructive' | 'success'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id, open: true }])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function Toast({ 
  id, 
  title, 
  description, 
  variant = 'default', 
  open = true,
  onOpenChange 
}: ToastProps) {
  const { removeToast } = useToast()

  const handleClose = () => {
    onOpenChange?.(false)
    removeToast(id)
  }

  if (!open) return null

  const variantStyles = {
    default: "border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
    destructive: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200",
    success: "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200",
  }

  return (
    <div className={cn(
      "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all max-w-full",
      variantStyles[variant]
    )}>
      <div className="grid gap-1">
        {title && (
          <div className="text-sm font-semibold">{title}</div>
        )}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>
      <button
        onClick={handleClose}
        className="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastViewport() {
  const { toasts } = useToast()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    
    // Create a separate container attached directly to body
    // This ensures it's not affected by any parent transforms
    const toastRoot = document.getElementById('toast-root')
    if (!toastRoot) {
      const newRoot = document.createElement('div')
      newRoot.id = 'toast-root'
      
      // Base styles
      newRoot.style.position = 'fixed'
      newRoot.style.zIndex = '9999'
      newRoot.style.pointerEvents = 'none'
      newRoot.style.display = 'flex'
      newRoot.style.flexDirection = 'column-reverse'
      newRoot.style.gap = '8px'
      newRoot.style.transform = 'none'
      newRoot.style.willChange = 'auto'
      
      // Mobile-first responsive positioning
      if (window.innerWidth < 640) {
        // Mobile: full width with padding, prevent overflow
        newRoot.style.bottom = '16px'
        newRoot.style.left = '16px'
        newRoot.style.right = '16px'
        newRoot.style.maxWidth = 'calc(100vw - 32px)'
        newRoot.style.width = 'calc(100vw - 32px)'
        newRoot.style.boxSizing = 'border-box'
      } else {
        // Desktop: positioned at bottom-right
        newRoot.style.bottom = '16px'
        newRoot.style.right = '16px'
        newRoot.style.left = 'auto'
        newRoot.style.maxWidth = '420px'
        newRoot.style.width = '420px'
        newRoot.style.boxSizing = 'border-box'
      }
      
      document.body.appendChild(newRoot)
    }
    
    // Handle window resize for responsive behavior
    const handleResize = () => {
      const toastRoot = document.getElementById('toast-root')
      if (toastRoot) {
        if (window.innerWidth < 640) {
          // Mobile: full width with padding, prevent overflow
          toastRoot.style.bottom = '16px'
          toastRoot.style.left = '16px'
          toastRoot.style.right = '16px'
          toastRoot.style.maxWidth = 'calc(100vw - 32px)'
          toastRoot.style.width = 'calc(100vw - 32px)'
          toastRoot.style.boxSizing = 'border-box'
        } else {
          // Desktop: positioned at bottom-right
          toastRoot.style.bottom = '16px'
          toastRoot.style.right = '16px'
          toastRoot.style.left = 'auto'
          toastRoot.style.maxWidth = '420px'
          toastRoot.style.width = '420px'
          toastRoot.style.boxSizing = 'border-box'
        }
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!mounted) return null

  const toastRoot = document.getElementById('toast-root')
  if (!toastRoot) return null

  return createPortal(
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </>,
    toastRoot
  )
}
