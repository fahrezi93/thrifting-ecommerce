'use client'

import { useState, useEffect } from 'react'

export type DisplayMode = 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen'

export function useDisplayMode() {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('browser')
  const [isInstalled, setIsInstalled] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Only run on client side
    if (typeof window === 'undefined') return

    // Check if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches

    if (isStandalone || isInWebAppiOS) {
      setDisplayMode('standalone')
      setIsInstalled(true)
    } else if (isMinimalUI) {
      setDisplayMode('minimal-ui')
      setIsInstalled(true)
    } else if (isFullscreen) {
      setDisplayMode('fullscreen')
      setIsInstalled(true)
    } else {
      setDisplayMode('browser')
      setIsInstalled(false)
    }

    // Listen for display mode changes
    const standaloneQuery = window.matchMedia('(display-mode: standalone)')
    const minimalUIQuery = window.matchMedia('(display-mode: minimal-ui)')
    const fullscreenQuery = window.matchMedia('(display-mode: fullscreen)')

    const handleDisplayModeChange = () => {
      if (standaloneQuery.matches || (window.navigator as any).standalone) {
        setDisplayMode('standalone')
        setIsInstalled(true)
      } else if (minimalUIQuery.matches) {
        setDisplayMode('minimal-ui')
        setIsInstalled(true)
      } else if (fullscreenQuery.matches) {
        setDisplayMode('fullscreen')
        setIsInstalled(true)
      } else {
        setDisplayMode('browser')
        setIsInstalled(false)
      }
    }

    standaloneQuery.addEventListener('change', handleDisplayModeChange)
    minimalUIQuery.addEventListener('change', handleDisplayModeChange)
    fullscreenQuery.addEventListener('change', handleDisplayModeChange)

    return () => {
      standaloneQuery.removeEventListener('change', handleDisplayModeChange)
      minimalUIQuery.removeEventListener('change', handleDisplayModeChange)
      fullscreenQuery.removeEventListener('change', handleDisplayModeChange)
    }
  }, [])

  return {
    displayMode,
    isInstalled,
    isBrowser: displayMode === 'browser',
    isStandalone: displayMode === 'standalone',
    isMinimalUI: displayMode === 'minimal-ui',
    isFullscreen: displayMode === 'fullscreen',
    isClient
  }
}
