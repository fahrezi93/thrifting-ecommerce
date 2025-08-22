'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { AlertModal } from '@/components/ui/modal'
import { Save, Store, Globe, Mail, Phone } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface StoreSettings {
  storeName: string
  storeDescription: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  isStoreActive: boolean
  allowRegistration: boolean
  maintenanceMode: boolean
}

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, title: string, description: string, variant?: 'default' | 'success' | 'error' | 'warning'}>({isOpen: false, title: '', description: ''})
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'Thrift Haven',
    storeDescription: 'Sustainable fashion for the conscious shopper. Discover unique, quality pre-loved clothing.',
    storeEmail: 'hello@thrifthaven.com',
    storePhone: '+62 123 456 7890',
    storeAddress: 'Jakarta, Indonesia',
    isStoreActive: true,
    allowRegistration: true,
    maintenanceMode: false,
  })
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    try {
      if (!user) return
      
      const token = await user.getIdToken()
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      if (!user) return
      
      setSaving(true)
      const token = await user.getIdToken()
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })
      
      if (response.ok) {
        // Show success message
        addToast({
          title: 'Success!',
          description: 'Settings saved successfully!',
          variant: 'success'
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setAlertModal({
        isOpen: true,
        title: 'Error',
        description: 'Error saving settings. Please try again.',
        variant: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof StoreSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return <div>Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground">
          Configure your store information and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="w-5 h-5 mr-2" />
              Store Information
            </CardTitle>
            <CardDescription>
              Basic information about your store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={settings.storeName}
                  onChange={(e) => handleInputChange('storeName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeEmail">Store Email</Label>
                <Input
                  id="storeEmail"
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => handleInputChange('storeEmail', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storePhone">Store Phone</Label>
                <Input
                  id="storePhone"
                  value={settings.storePhone}
                  onChange={(e) => handleInputChange('storePhone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Store Address</Label>
                <Input
                  id="storeAddress"
                  value={settings.storeAddress}
                  onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeDescription">Store Description</Label>
              <Textarea
                id="storeDescription"
                value={settings.storeDescription}
                onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Store Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Store Status
            </CardTitle>
            <CardDescription>
              Control store availability and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Store Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable the store for customers
                </p>
              </div>
              <Switch
                checked={settings.isStoreActive}
                onCheckedChange={(checked) => handleInputChange('isStoreActive', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new customers to register accounts
                </p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => handleInputChange('allowRegistration', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Show maintenance page to customers
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({isOpen: false, title: '', description: ''})}
        title={alertModal.title}
        description={alertModal.description}
        variant={alertModal.variant}
      />
    </div>
  )
}
