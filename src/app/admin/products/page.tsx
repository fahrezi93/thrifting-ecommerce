'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Trash2, Edit, Plus, Upload, X, Search, Package, Star } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ConfirmModal, AlertModal } from '@/components/ui/modal'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/contexts/AuthContext'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrls: string[]
  category: string
  size: string
  condition: string
  brand?: string
  color?: string
  stock: number
  isActive: boolean
  isFeatured: boolean
  createdAt: string
}

const categories = ['TOPS', 'BOTTOMS', 'DRESSES', 'OUTERWEAR', 'SHOES', 'ACCESSORIES']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const conditions = ['Excellent', 'Good', 'Fair']

export default function AdminProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, productId: string, productName: string}>({isOpen: false, productId: '', productName: ''})
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, title: string, description: string, variant?: 'default' | 'success' | 'error' | 'warning'}>({isOpen: false, title: '', description: ''})
  const { addToast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrls: [] as string[],
    category: '',
    size: '',
    condition: '',
    brand: '',
    color: '',
    stock: '1',
    isActive: true,
    isFeatured: false,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await apiClient.get('/api/admin/products')
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
      setError('Failed to load products: Please login as admin')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.imageUrls.length === 0) {
      setAlertModal({
        isOpen: true,
        title: 'Missing Images',
        description: 'Please upload at least one image before saving the product.',
        variant: 'warning'
      })
      return
    }
    
    try {
      if (!user) return
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        imageUrls: formData.imageUrls,
      }
      
      if (editingProduct) {
        await apiClient.put(`/api/admin/products/${editingProduct.id}`, productData)
      } else {
        await apiClient.post('/api/admin/products', productData)
      }
      
      await fetchProducts()
      setIsDialogOpen(false)
      resetForm()
      addToast({
        title: 'Success!',
        description: 'Product saved successfully!',
        variant: 'success'
      })
    } catch (error) {
      console.error('Error saving product:', error)
      setAlertModal({
        isOpen: true,
        title: 'Save Failed',
        description: 'Failed to save product. Please try again.',
        variant: 'error'
      })
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      imageUrls: product.imageUrls,
      category: product.category,
      size: product.size,
      condition: product.condition,
      brand: product.brand || '',
      color: product.color || '',
      stock: product.stock.toString(),
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({
      isOpen: true,
      productId: id,
      productName: name
    })
  }

  const handleDelete = async () => {
    const { productId } = deleteConfirm
    try {
      if (!user) return
      
      await apiClient.delete(`/api/admin/products/${productId}`)
      await fetchProducts()
      addToast({
        title: 'Success!',
        description: 'Product deleted successfully!',
        variant: 'success'
      })
    } catch (error) {
      console.error('Error deleting product:', error)
      setAlertModal({
        isOpen: true,
        title: 'Delete Failed',
        description: 'Failed to delete product. Please try again.',
        variant: 'error'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      imageUrls: [],
      category: '',
      size: '',
      condition: '',
      brand: '',
      color: '',
      stock: '1',
      isActive: true,
      isFeatured: false,
    })
    setEditingProduct(null)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const handleImageUpload = async (files: FileList) => {
    if (formData.imageUrls.length + files.length > 4) {
      setAlertModal({
        isOpen: true,
        title: 'Maksimal 4 Gambar',
        description: 'Anda hanya dapat mengunggah maksimal 4 gambar per produk.',
        variant: 'warning'
      })
      return
    }

    setUploadingImages(true)
    
    try {
      if (!user) {
        addToast({
          title: 'Authentication Required',
          description: 'Otentikasi diperlukan. Silakan login kembali.',
          variant: 'destructive'
        })
        setUploadingImages(false)
        return
      }

      const storage = getStorage() // Inisialisasi Firebase Storage
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const timestamp = Date.now()
        const extension = file.name.split('.').pop()
        const filename = `product-${timestamp}.${extension}`
        const storageRef = ref(storage, `products/${filename}`)

        try {
          // 1. Unggah file ke Firebase Storage
          const snapshot = await uploadBytes(storageRef, file)
          // 2. Dapatkan URL publik dari file yang diunggah
          const downloadURL = await getDownloadURL(snapshot.ref)
          uploadedUrls.push(downloadURL)
        } catch (error) {
          console.error('Firebase Storage upload error:', error)
          addToast({
            title: 'Upload Failed',
            description: `Gagal mengunggah ${file.name}`,
            variant: 'destructive'
          })
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...uploadedUrls]
        }))
        addToast({
          title: 'Success!',
          description: `${uploadedUrls.length} gambar berhasil diunggah!`,
          variant: 'success'
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      addToast({
        title: 'Upload Error',
        description: 'Terjadi kesalahan saat mengunggah gambar.',
        variant: 'destructive'
      })
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }))
  }

  const toggleFeatured = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFeatured: !currentStatus })
      })

      if (response.ok) {
        await fetchProducts()
        addToast({
          title: 'Success!',
          description: `Product ${!currentStatus ? 'added to' : 'removed from'} featured items`,
          variant: 'success'
        })
      } else {
        throw new Error('Failed to update featured status')
      }
    } catch (error) {
      console.error('Error toggling featured status:', error)
      addToast({
        title: 'Error',
        description: 'Failed to update featured status',
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <div>Loading products...</div>
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="font-semibold mb-2">Setup Instructions:</h3>
            <ol className="text-sm text-left space-y-1">
              <li>1. Login with email: <code>admin@admin.com</code></li>
              <li>2. Password: <code>123456</code></li>
              <li>3. Open browser console (F12)</li>
              <li>4. Copy and run the admin setup script</li>
              <li>5. Refresh the page</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct 
                  ? 'Update product information'
                  : 'Add a new product to your inventory'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (IDR)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand (Optional)</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color (Optional)</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                  />
                  <Label className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Featured on Homepage
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label>Product Images (Max 4)</Label>
                  
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadingImages || formData.imageUrls.length >= 4}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`cursor-pointer flex flex-col items-center justify-center py-4 ${
                        uploadingImages || formData.imageUrls.length >= 4 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <Plus className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        {uploadingImages 
                          ? 'Uploading...' 
                          : formData.imageUrls.length >= 4 
                            ? 'Maximum 4 images reached'
                            : 'Click to upload images or drag and drop'
                        }
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        PNG, JPG, WebP up to 5MB
                      </span>
                    </label>
                  </div>

                  {/* Image Preview */}
                  {formData.imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {formData.imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Update' : 'Add'} Product
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Add your first product to get started'}
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <Image
                  src={product.imageUrls && product.imageUrls[0] && (product.imageUrls[0].startsWith('http') || product.imageUrls[0].startsWith('/')) ? product.imageUrls[0] : '/placeholder-image.svg'}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                  <div className="flex gap-1">
                    <Button
                      variant={product.isFeatured ? "default" : "outline"}
                      size="icon"
                      onClick={() => toggleFeatured(product.id, product.isFeatured)}
                      title={product.isFeatured ? "Remove from featured" : "Add to featured"}
                    >
                      <Star className={`h-4 w-4 ${product.isFeatured ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(product.id, product.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <div className="flex gap-1">
                      <Badge variant={product.isActive ? 'default' : 'secondary'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {product.isFeatured && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Size: {product.size}</span>
                    <span>Stock: {product.stock}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="bg-muted px-2 py-1 rounded text-xs">
                      {product.condition}
                    </span>
                    <span className="bg-muted px-2 py-1 rounded text-xs">
                      {product.category}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Custom Modals */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({isOpen: false, productId: '', productName: ''})}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteConfirm.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

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
