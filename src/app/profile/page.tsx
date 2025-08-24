'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, MapPin, Calendar, Package, CreditCard } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  createdAt: string
  role: string
}

interface Order {
  id: string
  total: number
  status: string
  createdAt: string
  items: {
    id: string
    name: string
    price: number
    quantity: number
    imageUrls: string[]
  }[]
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/auth/signin')
      return
    }
    
    fetchProfile()
    fetchOrders()
  }, [user, loading, router])

  const fetchProfile = async () => {
    try {
      if (!user) return
      
      const token = await user.getIdToken(true) // Force refresh token
      console.log('Profile token length:', token.length)
      console.log('Profile token preview:', token.substring(0, 50) + '...')
      
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || ''
        })
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch profile:', response.status, response.statusText, errorText)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      if (!user) return
      
      const token = await user.getIdToken()
      const response = await fetch('/api/user/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (!user) return
      
      const token = await user.getIdToken()
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setIsEditing(false)
        addToast({
          title: 'Success!',
          description: 'Profile updated successfully!',
          variant: 'success'
        })
      } else {
        addToast({
          title: 'Error',
          description: 'Failed to update profile',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      addToast({
        title: 'Error',
        description: 'Network error occurred',
        variant: 'destructive'
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
      'PENDING': 'secondary',
      'PROCESSING': 'default',
      'SHIPPED': 'default',
      'DELIVERED': 'default',
      'CANCELLED': 'destructive'
    }
    
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Please sign in to view your profile</h2>
          <Button onClick={() => router.push('/auth/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information and view your orders</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal information and contact details
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={profile.email}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Account Type</Label>
                        <Input
                          id="role"
                          value={profile.role}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter your full address"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button type="submit">Save Changes</Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Full Name</p>
                            <p className="font-medium">{profile.name || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{profile.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{profile.phone || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Address</p>
                            <p className="font-medium">{profile.address || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Member Since</p>
                            <p className="font-medium">{formatDate(profile.createdAt)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Account Type</p>
                            <Badge variant="outline">{profile.role}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order History
                </CardTitle>
                <CardDescription>
                  View all your past orders and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start shopping to see your orders here
                    </p>
                    <Button onClick={() => router.push('/shop')}>
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold">Order #{order.id.slice(-8)}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(order.status)}
                              <p className="font-semibold mt-1">{formatPrice(order.total)}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 p-2 bg-muted rounded">
                                <img
                                  src={item.imageUrls[0] || '/placeholder-image.svg'}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {item.quantity} × {formatPrice(item.price)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
