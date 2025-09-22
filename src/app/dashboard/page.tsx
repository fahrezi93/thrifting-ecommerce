'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Package, DollarSign, Heart } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface UserStatistics {
  totalOrders: number
  totalSpent: number
  itemsSaved: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    totalAmount: number
    status: string
    createdAt: string
    itemCount: number
  }>
  averageOrderValue: number
  completedOrders: number
  pendingOrders: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [statistics, setStatistics] = useState<UserStatistics | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      // Load additional user data
      fetchUserData()
      fetchUserStatistics()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      const userData = await apiClient.get('/api/user/profile')
      setPhone(userData.phone || '')
    } catch (error) {
      console.error('Error fetching user data:', error)
      // Continue without phone data if API fails
    }
  }

  const fetchUserStatistics = async () => {
    try {
      if (!user) {
        setStatsLoading(false)
        return
      }
      
      if (!user.getIdToken) {
        console.error('User authentication error: getIdToken method not available')
        setStatsLoading(false)
        return
      }
      
      const token = await user.getIdToken()
      if (!token) {
        console.error('User authentication error: no token received')
        setStatsLoading(false)
        return
      }
      
      const response = await fetch('/api/user/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const stats = await response.json()
        setStatistics(stats)
      } else {
        const errorData = await response.text()
        console.error('Failed to fetch user statistics:', response.status, errorData)
        
        // Set empty statistics as fallback
        setStatistics({
          totalOrders: 0,
          totalSpent: 0,
          itemsSaved: 0,
          recentOrders: [],
          averageOrderValue: 0,
          completedOrders: 0,
          pendingOrders: 0
        })
      }
    } catch (error) {
      console.error('Error fetching user statistics:', error)
      
      // Set empty statistics as fallback
      setStatistics({
        totalOrders: 0,
        totalSpent: 0,
        itemsSaved: 0,
        recentOrders: [],
        averageOrderValue: 0,
        completedOrders: 0,
        pendingOrders: 0
      })
    } finally {
      setStatsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      if (!user?.getIdToken) {
        setMessage('Authentication error')
        return
      }
      const token = await user.getIdToken()
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          phone,
        }),
      })

      if (response.ok) {
        setMessage('Profile updated successfully!')
      } else {
        setMessage('Failed to update profile')
      }
    } catch (error) {
      setMessage('An error occurred while updating profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {message && (
              <div className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </div>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
          <CardDescription>
            Your Thrift Haven journey so far
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading statistics...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Package className="h-5 w-5 text-primary mr-2" />
                </div>
                <div className="text-2xl font-bold text-primary">
                  {statistics?.totalOrders ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-5 w-5 text-primary mr-2" />
                </div>
                <div className="text-2xl font-bold text-primary">
                  {statistics ? formatPrice(statistics.totalSpent || 0) : 'Rp 0'}
                </div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="h-5 w-5 text-primary mr-2" />
                </div>
                <div className="text-2xl font-bold text-primary">
                  {statistics?.itemsSaved ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">Items Saved</div>
              </div>
            </div>
          )}
          
          {statistics && statistics.recentOrders && statistics.recentOrders.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Recent Orders</h4>
              <div className="space-y-2">
                {statistics.recentOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">#{order.orderNumber.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.itemCount} items • {new Date(order.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(order.totalAmount)}</p>
                      <p className="text-sm text-muted-foreground">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
