'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Bell, Shield, User, Moon, Sun, Trash2, LogOut, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface UserPreferences {
  id: string
  userId: string
  emailNotifications: boolean
  orderUpdates: boolean
  promotions: boolean
  darkMode: boolean
  profileVisibility: boolean
  dataSharing: boolean
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  
  // Individual state for each preference
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [orderUpdates, setOrderUpdates] = useState(true)
  const [promotions, setPromotions] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [profileVisibility, setProfileVisibility] = useState(true)
  const [dataSharing, setDataSharing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserPreferences()
    }
  }, [user])

  const fetchUserPreferences = async () => {
    try {
      if (!user) return
      
      const token = await user.getIdToken?.()
      if (!token) return
      
      const response = await fetch('/api/user/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const prefs = await response.json()
        setPreferences(prefs)
        
        // Update individual state variables
        setEmailNotifications(prefs.emailNotifications)
        setOrderUpdates(prefs.orderUpdates)
        setPromotions(prefs.promotions)
        setDarkMode(prefs.darkMode)
        setProfileVisibility(prefs.profileVisibility)
        setDataSharing(prefs.dataSharing)
        
        // Apply dark mode to document
        if (prefs.darkMode) {
          document.documentElement.classList.add('dark')
          localStorage.setItem('theme', 'dark')
        } else {
          document.documentElement.classList.remove('dark')
          localStorage.setItem('theme', 'light')
        }
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      addToast({
        title: 'Error',
        description: 'Failed to load preferences',
        variant: 'destructive'
      })
    }
  }

  const handleSaveNotifications = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      if (!user) return
      
      const token = await user.getIdToken?.()
      if (!token) return
      
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          emailNotifications,
          orderUpdates,
          promotions
        })
      })
      
      if (response.ok) {
        const updatedPrefs = await response.json()
        setPreferences(updatedPrefs)
        addToast({
          title: 'Success!',
          description: 'Notification preferences updated successfully!',
          variant: 'success'
        })
      } else {
        throw new Error('Failed to update preferences')
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      addToast({
        title: 'Error',
        description: 'Failed to update notification preferences',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleThemeToggle = async (enabled: boolean) => {
    setDarkMode(enabled)
    localStorage.setItem('theme', enabled ? 'dark' : 'light')
    
    // Apply theme to document immediately
    if (enabled) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Save to API
    try {
      if (!user) return
      
      const token = await user.getIdToken?.()
      if (!token) return
      
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          darkMode: enabled
        })
      })
      
      if (response.ok) {
        const updatedPrefs = await response.json()
        setPreferences(updatedPrefs)
        addToast({
          title: 'Success!',
          description: 'Theme updated successfully!',
          variant: 'success'
        })
      }
    } catch (error) {
      console.error('Error updating theme preference:', error)
      addToast({
        title: 'Error',
        description: 'Failed to save theme preference',
        variant: 'destructive'
      })
    }
  }

  const handlePrivacySettingChange = async (setting: 'profileVisibility' | 'dataSharing', value: boolean) => {
    try {
      if (!user) return
      
      const token = await user.getIdToken?.()
      if (!token) return
      
      // Update local state immediately
      if (setting === 'profileVisibility') {
        setProfileVisibility(value)
      } else {
        setDataSharing(value)
      }
      
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          [setting]: value
        })
      })
      
      if (response.ok) {
        const updatedPrefs = await response.json()
        setPreferences(updatedPrefs)
        addToast({
          title: 'Success!',
          description: 'Privacy setting updated successfully!',
          variant: 'success'
        })
      }
    } catch (error) {
      console.error('Error updating privacy setting:', error)
      addToast({
        title: 'Error',
        description: 'Failed to update privacy setting',
        variant: 'destructive'
      })
      
      // Revert local state on error
      if (setting === 'profileVisibility') {
        setProfileVisibility(!value)
      } else {
        setDataSharing(!value)
      }
    }
  }

  const handleDeleteAccount = async () => {
    setIsLoading(true)
    try {
      // This would typically call an API to delete the account
      console.log('Account deletion requested')
      setMessage('Account deletion request submitted. You will receive an email confirmation.')
    } catch (error) {
      setMessage('Failed to process account deletion request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      {message && (
        <div className={`p-3 rounded-md text-sm ${
          message.includes('success') || message.includes('updated') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your basic account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm">{user?.name || 'Not set'}</span>
                <Badge variant="secondary">Verified</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm">{user?.email}</span>
                {user?.emailVerified && <Badge variant="default">Verified</Badge>}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            To update your account information, please go to the Profile section.
          </p>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose what notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Order Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about order status changes
                </p>
              </div>
              <Switch
                checked={orderUpdates}
                onCheckedChange={setOrderUpdates}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Promotions & Offers</Label>
                <p className="text-sm text-muted-foreground">
                  Receive promotional emails and special offers
                </p>
              </div>
              <Switch
                checked={promotions}
                onCheckedChange={setPromotions}
              />
            </div>
          </div>
          
          <Button onClick={handleSaveNotifications} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Notification Preferences'}
          </Button>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how Thrift Haven looks for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Control your privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Make your profile visible to other users
                </p>
              </div>
              <Switch
                checked={profileVisibility}
                onCheckedChange={(value) => handlePrivacySettingChange('profileVisibility', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Share anonymized data to improve our services
                </p>
              </div>
              <Switch
                checked={dataSharing}
                onCheckedChange={(value) => handlePrivacySettingChange('dataSharing', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
