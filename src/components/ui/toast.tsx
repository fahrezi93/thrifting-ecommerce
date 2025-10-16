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
      "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
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
  }, [])

  if (!mounted) return null

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    left: 'auto',
    top: 'auto',
    zIndex: 9999,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column-reverse',
    gap: '8px',
    width: 'calc(100vw - 32px)',
    maxWidth: '420px',
  }

  // For mobile screens
  if (typeof window !== 'undefined' && window.innerWidth < 640) {
    containerStyle.right = '16px'
    containerStyle.left = '16px'
    containerStyle.width = 'auto'
    containerStyle.maxWidth = 'none'
  }

  return createPortal(
    <div data-toast-viewport style={containerStyle}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>,
    document.body
  )
}
