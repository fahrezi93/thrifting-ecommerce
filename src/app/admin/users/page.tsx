'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Shield, User, Mail, Calendar, MoreHorizontal } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

interface UserData {
  id: string
  name: string | null
  email: string
  role: string
  emailVerified: boolean
  createdAt: string
  image: string | null
  _count: {
    orders: number
    addresses: number
  }
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUsers()
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      if (!user) return
      
      const data = await apiClient.get('/api/admin/users')
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      if (!user) return
      
      await apiClient.put(`/api/admin/users/${userId}`, { role: newRole })
      toast.success('User role updated successfully')
      fetchUsers() // Refresh users
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getRoleBadge = (role: string) => {
    return role === 'ADMIN' ? (
      <Badge variant="default">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="secondary">
        <User className="w-3 h-3 mr-1" />
        User
      </Badge>
    )
  }

  if (loading) {
    return <div>Loading users...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>

      <div className="grid gap-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        ) : (
          users.map((userData) => (
            <Card key={userData.id}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex items-start space-x-3 md:space-x-4 flex-1">
                    <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
                      <AvatarImage src={userData.image || ''} alt={userData.name || userData.email} />
                      <AvatarFallback>
                        {userData.name ? userData.name.charAt(0).toUpperCase() : userData.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm md:text-base truncate">{userData.name || 'No Name'}</h3>
                        {getRoleBadge(userData.role)}
                        {userData.emailVerified && (
                          <Badge variant="outline" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                          <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{userData.email}</span>
                        </div>
                        <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span>Joined {formatDate(userData.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs md:text-sm text-muted-foreground">
                          <span>{userData._count.orders} orders</span>
                          <span>{userData._count.addresses} addresses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end md:justify-start">
                    {userData.role === 'USER' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateUserRole(userData.id, 'ADMIN')}
                        className="text-xs md:text-sm"
                      >
                        Make Admin
                      </Button>
                    ) : userData.id !== user?.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateUserRole(userData.id, 'USER')}
                        className="text-xs md:text-sm"
                      >
                        Remove Admin
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
