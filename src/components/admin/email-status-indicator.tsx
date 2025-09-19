'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react'

export function EmailStatusIndicator() {
  const [emailStatus, setEmailStatus] = useState<'development' | 'resend' | 'unknown'>('unknown')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Check if Resend API key is configured
    const checkEmailConfig = async () => {
      try {
        const response = await fetch('/api/admin/email-status')
        if (response.ok) {
          const data = await response.json()
          setEmailStatus(data.hasResendKey ? 'resend' : 'development')
        } else {
          setEmailStatus('development')
        }
      } catch (error) {
        // Fallback: check based on environment
        const isDevelopment = process.env.NODE_ENV === 'development' || 
                             typeof window !== 'undefined' && window.location.hostname === 'localhost'
        setEmailStatus(isDevelopment ? 'development' : 'resend')
      }
    }

    checkEmailConfig()
  }, [])

  // Prevent hydration mismatch by only rendering on client
  if (!isClient || emailStatus === 'unknown') return null

  return (
    <div className="mb-4">
      {emailStatus === 'development' ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm sm:text-base">Development Mode:</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Emails are logged to console. Add RESEND_API_KEY to your .env.local to enable real email sending.
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 sm:ml-4 flex-shrink-0">
                <Badge variant="outline" className="w-fit">
                  <Mail className="h-3 w-3 mr-1" />
                  Console Only
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://resend.com', '_blank')}
                  className="w-full sm:w-auto"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Setup Resend
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm sm:text-base">Resend Active:</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Emails will be sent via Resend API. Check your Resend dashboard for delivery status and analytics.
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 sm:ml-4 flex-shrink-0">
                <Badge variant="default" className="w-fit">
                  <Mail className="h-3 w-3 mr-1" />
                  Live Email
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://resend.com/emails', '_blank')}
                  className="w-full sm:w-auto"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Dashboard
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
