'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react'

export function EmailStatusIndicator() {
  const [emailStatus, setEmailStatus] = useState<'development' | 'resend' | 'unknown'>('unknown')

  useEffect(() => {
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

  if (emailStatus === 'unknown') return null

  return (
    <div className="mb-4">
      {emailStatus === 'development' ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Development Mode:</strong> Emails are logged to console. 
                <br />
                <span className="text-sm text-muted-foreground">
                  Add RESEND_API_KEY to your .env.local to enable real email sending.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <Mail className="h-3 w-3 mr-1" />
                  Console Only
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://resend.com', '_blank')}
                  className="ml-2"
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
            <div className="flex items-center justify-between">
              <div>
                <strong>Resend Active:</strong> Emails will be sent via Resend API.
                <br />
                <span className="text-sm text-muted-foreground">
                  Check your Resend dashboard for delivery status and analytics.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">
                  <Mail className="h-3 w-3 mr-1" />
                  Live Email
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://resend.com/emails', '_blank')}
                  className="ml-2"
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
