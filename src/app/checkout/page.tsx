'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/store/cart'
import { ChevronLeft, ChevronRight, MapPin, CreditCard, Truck, Zap } from 'lucide-react'
import Image from 'next/image'

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

interface ShippingOption {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
  icon: React.ComponentType<{ className?: string }>
}

export default function CheckoutPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCart()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [selectedShippingId, setSelectedShippingId] = useState('regular')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const shippingOptions: ShippingOption[] = [
    {
      id: 'regular',
      name: 'Regular Shipping',
      description: 'Standard delivery',
      price: 15000,
      estimatedDays: '3-5 business days',
      icon: Truck
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: 'Fast delivery',
      price: 25000,
      estimatedDays: '1-2 business days',
      icon: Zap
    }
  ]

  const subtotal = getTotalPrice()
  const selectedShipping = shippingOptions.find(option => option.id === selectedShippingId)
  const shippingCost = subtotal >= 500000 ? 0 : (selectedShipping?.price || 15000)
  const totalAmount = subtotal + shippingCost

  useEffect(() => {
    if (loading) return // Wait for auth to load
    
    if (!user) {
      router.push('/auth/signin')
      return
    }

    if (items.length === 0) {
      router.push('/products')
      return
    }

    fetchAddresses()
  }, [user, loading, items, router])

  const fetchAddresses = async () => {
    try {
      if (!user || !user.getIdToken) return
      
      const token = await user.getIdToken()
      const response = await fetch('/api/user/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setAddresses(data)
        
        // Auto-select default address
        const defaultAddress = data.find((addr: Address) => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedAddressId) {
      setError('Please select a shipping address')
      return
    }
    if (currentStep === 2 && !selectedShippingId) {
      setError('Please select a shipping option')
      return
    }
    
    setError('')
    setCurrentStep(currentStep + 1)
  }

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handlePayment = async () => {
    setIsLoading(true)
    setError('')

    try {
      if (!user || !user.getIdToken) return
      
      const token = await user.getIdToken()
      
      // Step 1: Create order first
      const createOrderResponse = await fetch('/api/payment/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          shippingAddressId: selectedAddressId,
          shippingOption: selectedShippingId,
          totalAmount,
          shippingCost,
        }),
      })

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const { orderId } = await createOrderResponse.json()
      
      // Redirect to custom payment page instead of DOKU checkout
      router.push(`/payment/custom?orderId=${orderId}`)
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId)

  if (!user || items.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              1
            </div>
            <div className={`h-0.5 w-16 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              2
            </div>
            <div className={`h-0.5 w-16 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              3
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                  <CardDescription>
                    Select where you want your items delivered
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        No addresses found. Please add an address first.
                      </p>
                      <Button onClick={() => router.push('/dashboard/addresses')}>
                        Add Address
                      </Button>
                    </div>
                  ) : (
                    <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <div key={address.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                            <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                            <div className="flex-1">
                              <Label htmlFor={address.id} className="cursor-pointer">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold">{address.name}</span>
                                  {address.isDefault && (
                                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <p>{address.street}</p>
                                  <p>{address.city}, {address.state} {address.postalCode}</p>
                                  <p>{address.country}</p>
                                  {address.phone && <p>Phone: {address.phone}</p>}
                                </div>
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                  
                  {error && (
                    <div className="text-sm text-destructive mt-4">
                      {error}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Options
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred shipping method
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedShippingId} onValueChange={setSelectedShippingId}>
                    <div className="space-y-4">
                      {shippingOptions.map((option) => {
                        const IconComponent = option.icon
                        const finalPrice = subtotal >= 500000 ? 0 : option.price
                        return (
                          <div key={option.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                            <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                            <div className="flex-1">
                              <Label htmlFor={option.id} className="cursor-pointer">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    <span className="font-semibold">{option.name}</span>
                                  </div>
                                  <span className="font-semibold">
                                    {finalPrice === 0 ? (
                                      <span className="text-green-600">FREE</span>
                                    ) : (
                                      formatPrice(finalPrice)
                                    )}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <p>{option.description} • {option.estimatedDays}</p>
                                </div>
                              </Label>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </RadioGroup>
                  
                  {subtotal >= 500000 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <Truck className="h-4 w-4" />
                        <span className="text-sm font-medium">🎉 Free shipping on orders over Rp 500,000!</span>
                      </div>
                    </div>
                  )}
                  
                  {error && (
                    <div className="text-sm text-destructive mt-4">
                      {error}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Order Review
                  </CardTitle>
                  <CardDescription>
                    Review your order before proceeding to payment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Shipping Address Summary */}
                  {selectedAddress && (
                    <div>
                      <h4 className="font-semibold mb-2">Shipping Address</h4>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="font-medium">{selectedAddress.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAddress.street}<br />
                          {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}<br />
                          {selectedAddress.country}
                          {selectedAddress.phone && <><br />Phone: {selectedAddress.phone}</>}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Shipping Information */}
                  <div>
                    <h4 className="font-semibold mb-2">Shipping Information</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {selectedShipping && (
                            <selectedShipping.icon className="h-4 w-4" />
                          )}
                          <span className="font-medium">{selectedShipping?.name}</span>
                        </div>
                        <span className="font-semibold">
                          {shippingCost === 0 ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            formatPrice(shippingCost)
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedShipping?.description} • {selectedShipping?.estimatedDays}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold mb-2">Order Items</h4>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-4 p-3 border rounded-lg">
                          <div className="relative h-16 w-16 flex-shrink-0">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">{item.name}</h5>
                            <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-sm">Qty: {item.quantity}</span>
                              <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-destructive">
                      {error}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 h-fit">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({items.length} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping{shippingCost === 0 ? ' (FREE)' : ''}</span>
                    <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                      {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  {subtotal >= 500000 && shippingCost === 0 && (
                    <div className="text-xs text-green-600">
                      🎉 Free shipping applied!
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  {currentStep < 3 ? (
                    <>
                      {currentStep > 1 && (
                        <Button variant="outline" onClick={handlePrevStep} className="w-full">
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Back
                        </Button>
                      )}
                      <Button onClick={handleNextStep} className="w-full">
                        Continue
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={handlePrevStep} className="w-full">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button 
                        onClick={handlePayment} 
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Proceed to Payment'}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
