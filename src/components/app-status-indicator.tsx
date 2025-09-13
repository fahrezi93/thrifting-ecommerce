'use client'

import { useDisplayMode } from '@/hooks/use-display-mode'
import { Badge } from '@/components/ui/badge'
import { Smartphone, Globe } from 'lucide-react'

export function AppStatusIndicator() {
  const { isInstalled, displayMode } = useDisplayMode()

  if (!isInstalled) return null

  return (
    <div className="fixed top-4 right-4 z-40">
      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
        <Smartphone className="w-3 h-3 mr-1" />
        App Mode
      </Badge>
    </div>
  )
}

export function AppModeStyles() {
  const { isInstalled } = useDisplayMode()

  if (!isInstalled) return null

  return (
    <style jsx global>{`
      /* App-specific styles when installed */
      .app-mode-header {
        background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary))/0.8 100%);
        color: hsl(var(--primary-foreground));
      }
      
      .app-mode-card {
        border: 1px solid hsl(var(--primary))/0.2;
        background: hsl(var(--primary))/0.02;
      }
      
      .app-mode-button {
        background: hsl(var(--primary));
        color: hsl(var(--primary-foreground));
        border-radius: 12px;
        font-weight: 600;
      }
      
      .app-mode-nav {
        backdrop-filter: blur(20px);
        background: hsl(var(--background))/0.9;
        border-bottom: 1px solid hsl(var(--primary))/0.1;
      }
    `}</style>
  )
}
