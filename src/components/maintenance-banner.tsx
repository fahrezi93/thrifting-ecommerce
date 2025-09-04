'use client'

import { useStore } from '@/contexts/StoreContext'
import { useAuth } from '@/contexts/AuthContext'
import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'

export function MaintenanceBanner() {
  const { settings } = useStore()
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  // Don't show banner if:
  // - Settings not loaded
  // - Not in maintenance mode
  // - User is admin
  // - Banner was dismissed
  if (!settings?.maintenanceMode || user?.role === 'ADMIN' || dismissed) {
    return null
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Website Under Maintenance
            </p>
            <p className="text-xs text-yellow-700">
              Some features may be temporarily unavailable. Shopping and checkout are disabled.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-yellow-600 hover:text-yellow-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
