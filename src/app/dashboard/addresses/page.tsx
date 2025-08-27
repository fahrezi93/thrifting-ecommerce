'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Plus, MapPin } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { ConfirmModal } from '@/components/ui/modal'
import { apiClient } from '@/lib/api-client'

interface Address {
  id: string
  name: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
}

export default function AddressesPage() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, addressId: string, addressLabel: string}>({isOpen: false, addressId: '', addressLabel: ''})
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Indonesia',
    phone: '',
    isDefault: false,
  })

  useEffect(() => {
    if (user) {
      fetchAddresses()
    } else {
      // If no user, stop loading immediately
      setIsLoading(false)
    }
  }, [user])
  
  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Address loading timeout - stopping loading state')
        setIsLoading(false)
        setAddresses([])
      }
    }, 10000) // 10 second timeout
    
    return () => clearTimeout(timeout)
  }, [isLoading])

  const fetchAddresses = async () => {
    try {
      if (!user) {
        setIsLoading(false)
        return
      }
      
      const addressList = await apiClient.get('/api/user/addresses')
      setAddresses(addressList)
    } catch (error) {
      console.error('Error fetching addresses:', error)
      setAddresses([])
      addToast({
        title: 'Error',
        description: 'Failed to fetch addresses',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (!user) return
      
      if (editingAddress) {
        // Update existing address
        await apiClient.put(`/api/user/addresses/${editingAddress.id}`, formData)
      } else {
        // Add new address
        await apiClient.post('/api/user/addresses', formData)
      }
      
      fetchAddresses()
      setFormData({
        name: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Indonesia',
        phone: '',
        isDefault: false,
      })
      setIsDialogOpen(false)
      setEditingAddress(null)
      addToast({
        title: 'Success!',
        description: editingAddress ? 'Address updated successfully!' : 'Address added successfully!',
        variant: 'success'
      })
    } catch (error) {
      console.error('Error saving address:', error)
      addToast({
        title: 'Error',
        description: 'Failed to save address',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (address: Address) => {
    setFormData({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault,
    })
    setEditingAddress(address)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (id: string, label: string) => {
    setDeleteConfirm({
      isOpen: true,
      addressId: id,
      addressLabel: label
    })
  }

  const handleDelete = async () => {
    const { addressId } = deleteConfirm
    try {
      if (!user) return
      
      await apiClient.delete(`/api/user/addresses/${addressId}`)
      
      fetchAddresses()
      setDeleteConfirm({ isOpen: false, addressId: '', addressLabel: '' })
      addToast({
        title: 'Success!',
        description: 'Address deleted successfully!',
        variant: 'success'
      })
    } catch (error) {
      console.error('Error deleting address:', error)
      addToast({
        title: 'Error',
        description: 'Failed to delete address',
        variant: 'destructive'
      })
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setFormData({
      name: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Indonesia',
      phone: '',
      isDefault: false,
    })
    setEditingAddress(null)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Addresses</h1>
          <p className="text-gray-600">Manage your delivery addresses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setFormData({ name: '', street: '', city: '', state: '', postalCode: '', country: 'Indonesia', phone: '', isDefault: false, }); setEditingAddress(null); setIsDialogOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
              <DialogDescription>
                {editingAddress ? 'Update your address information.' : 'Add a new delivery address to your account.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  placeholder="Street Address"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    placeholder="Postal Code"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAddress ? 'Update Address' : 'Add Address'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
            <p className="text-gray-500 mb-4">Add your first delivery address to get started.</p>
            <Button onClick={() => { 
              setFormData({
                name: '',
                street: '',
                city: '',
                state: '',
                postalCode: '',
                country: 'Indonesia',
                phone: '',
                isDefault: false,
              });
              setEditingAddress(null);
              setIsDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <Card key={address.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {address.name}
                    {address.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(address)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(address.id, address.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state} {address.postalCode}</p>
                  <p>{address.country}</p>
                  {address.phone && <p>Phone: {address.phone}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({isOpen: false, addressId: '', addressLabel: ''})}
        onConfirm={handleDelete}
        title="Delete Address"
        description={`Are you sure you want to delete "${deleteConfirm.addressLabel}"? This action cannot be undone.`}
      />
    </div>
  )
}
