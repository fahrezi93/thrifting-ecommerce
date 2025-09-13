import React from 'react'
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { AuthProvider } from '@/contexts/AuthContext'
import { StoreProvider } from '@/contexts/StoreContext'
import { StoreStatusWrapper } from '@/middleware/store-status'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ToastProvider, ToastViewport } from '@/components/ui/toast'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Thrift Haven - Sustainable Fashion Marketplace',
  description: 'Discover unique pre-loved fashion items and contribute to sustainable shopping',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Thrift Haven',
  },
  icons: {
    icon: [
      { url: '/Icon-Web.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '64x64 32x32 24x24 16x16', type: 'image/x-icon' },
    ],
    apple: '/Logo-App-Mobile.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/Icon-Web.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/Logo-App-Mobile.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Thrift Haven" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <StoreProvider>
            <StoreStatusWrapper>
              <Providers>
                <ToastProvider>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                      {children}
                    </main>
                    <Footer />
                  </div>
                  <ToastViewport />
                  <PWAInstallPrompt />
                </ToastProvider>
              </Providers>
            </StoreStatusWrapper>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
