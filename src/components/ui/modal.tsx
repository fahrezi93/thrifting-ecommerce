"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={cn(
        "relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-auto",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        className
      )}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        {children}
      </div>
    </div>
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          {variant === 'destructive' ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <X className="h-5 w-5 text-red-600" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <span className="text-blue-600 text-lg">?</span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">{description}</p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={cn(
              "px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2",
              variant === 'destructive' 
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" 
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  variant?: 'default' | 'success' | 'error' | 'warning'
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  description,
  variant = 'default'
}: AlertModalProps) {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      case 'error':
        return <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
          <X className="h-5 w-5 text-red-600" />
        </div>
      case 'warning':
        return <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
          <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      default:
        return <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          {getIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">{description}</p>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  )
}
