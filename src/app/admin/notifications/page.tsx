'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Bell, Send, Users, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationResult {
  success: boolean
  sent: number
  failed: number
  total: number
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<NotificationResult | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    url: '',
    tag: 'promo'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.body) {
      toast.error("Title and message are required")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          body: formData.body,
          url: formData.url || '/',
          tag: formData.tag,
          icon: '/Logo-App-Mobile.svg'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        toast.success(`Notification sent to ${data.sent} users`)
        
        // Reset form
        setFormData({
          title: '',
          body: '',
          url: '',
          tag: 'promo'
        })
      } else {
        throw new Error(data.error || 'Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  const presetMessages = [
    {
      title: "🔥 Flash Sale 50% OFF!",
      body: "Jangan sampai terlewat! Diskon besar-besaran hari ini saja.",
      url: "/products?promo=flash50"
    },
    {
      title: "✨ Koleksi Baru Tiba!",
      body: "Temukan item fashion terbaru dengan kualitas premium.",
      url: "/products?filter=new"
    },
    {
      title: "💝 Gratis Ongkir Hari Ini",
      body: "Belanja sekarang dan dapatkan gratis ongkir ke seluruh Indonesia!",
      url: "/products"
    }
  ]

  const usePreset = (preset: typeof presetMessages[0]) => {
    setFormData({
      title: preset.title,
      body: preset.body,
      url: preset.url,
      tag: 'promo'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Push Notifications</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Flash Sale 50% OFF!"
                  required
                />
              </div>

              <div>
                <Label htmlFor="body">Message *</Label>
                <Textarea
                  id="body"
                  name="body"
                  value={formData.body}
                  onChange={handleInputChange}
                  placeholder="e.g., Jangan sampai terlewat! Diskon besar-besaran hari ini saja."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="url">Target URL (optional)</Label>
                <Input
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="e.g., /products?promo=flash50"
                />
              </div>

              <div>
                <Label htmlFor="tag">Tag</Label>
                <Input
                  id="tag"
                  name="tag"
                  value={formData.tag}
                  onChange={handleInputChange}
                  placeholder="promo"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send to All Users'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preset Messages & Results */}
        <div className="space-y-6">
          {/* Preset Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {presetMessages.map((preset, index) => (
                <div 
                  key={index}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => usePreset(preset)}
                >
                  <h4 className="font-medium text-sm">{preset.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{preset.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  Send Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{result.sent}</div>
                    <div className="text-xs text-muted-foreground">Sent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{result.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                How it Works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Notifications are sent to users who have installed the PWA</p>
              <p>• Users must have enabled push notifications</p>
              <p>• Notifications appear even when the app is closed</p>
              <p>• Clicking the notification opens the app to the target URL</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
