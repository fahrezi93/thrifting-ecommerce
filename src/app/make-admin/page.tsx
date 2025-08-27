'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function MakeAdminPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const makeAdmin = async () => {
    if (!user) {
      setResult({ success: false, message: 'Please login first' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await apiClient.post('/api/auth/make-admin')
      setResult({ success: true, message: 'Successfully updated to ADMIN role!' })
      
      // Refresh the page after 2 seconds to update navbar
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      setResult({ success: false, message: 'Failed to update role. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Make Admin</CardTitle>
          <CardDescription>
            Click the button below to give your current account admin privileges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="text-sm text-muted-foreground">
              <p><strong>Current User:</strong> {user.email}</p>
            </div>
          )}

          <Button 
            onClick={makeAdmin} 
            disabled={loading || !user}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Make Me Admin'}
          </Button>

          {result && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              result.success 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm">{result.message}</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>After becoming admin, you'll see an "Admin Panel" option in your user menu.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
