'use client'

import React from 'react'
import { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import { ToastProvider } from '@/components/ui/toast'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={true}
      storageKey="thrift-haven-theme"
      forcedTheme={undefined}
    >
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  )
}
