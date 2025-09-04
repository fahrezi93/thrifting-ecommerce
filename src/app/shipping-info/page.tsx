'use client'

import { Truck, Clock, MapPin, Package, Shield, CreditCard } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStoreSettings } from '@/hooks/use-store-settings'

const shippingOptions = [
  {
    name: "Standard Shipping",
    duration: "3-7 Business Days",
    cost: "Rp 15,000 - Rp 25,000",
    description: "Reliable delivery for most areas in Indonesia",
    icon: Package
  },
  {
    name: "Express Shipping",
    duration: "1-3 Business Days",
    cost: "Rp 25,000 - Rp 45,000",
    description: "Fast delivery for urgent orders",
    icon: Truck
  },
  {
    name: "Same Day Delivery",
    duration: "Same Day",
    cost: "Rp 35,000 - Rp 55,000",
    description: "Available in Jakarta, Surabaya, and Bandung",
    icon: Clock
  }
]

const coverageAreas = [
  { region: "Jabodetabek", cities: ["Jakarta", "Bogor", "Depok", "Tangerang", "Bekasi"], delivery: "1-2 days" },
  { region: "Jawa Barat", cities: ["Bandung", "Cirebon", "Sukabumi", "Tasikmalaya"], delivery: "2-3 days" },
  { region: "Jawa Tengah", cities: ["Semarang", "Solo", "Yogyakarta", "Magelang"], delivery: "3-4 days" },
  { region: "Jawa Timur", cities: ["Surabaya", "Malang", "Kediri", "Jember"], delivery: "3-4 days" },
  { region: "Sumatra", cities: ["Medan", "Palembang", "Pekanbaru", "Padang"], delivery: "4-6 days" },
  { region: "Kalimantan", cities: ["Balikpapan", "Banjarmasin", "Pontianak"], delivery: "5-7 days" },
  { region: "Sulawesi", cities: ["Makassar", "Manado", "Palu"], delivery: "5-7 days" },
  { region: "Bali & Nusa Tenggara", cities: ["Denpasar", "Mataram", "Kupang"], delivery: "4-6 days" }
]

export default function ShippingInfo() {
  const { settings, loading } = useStoreSettings()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping Information</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fast, reliable delivery across Indonesia with multiple shipping options
          </p>
        </div>

        {/* Shipping Options */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Options</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {shippingOptions.map((option, index) => {
              const IconComponent = option.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{option.name}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {option.duration}
                      </Badge>
                    </div>
                    <p className="text-lg font-semibold text-green-600">{option.cost}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Coverage Areas */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Coverage</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coverageAreas.map((area, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-red-500" />
                    {area.region}
                  </CardTitle>
                  <Badge variant="outline">{area.delivery}</Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {area.cities.map((city, cityIndex) => (
                      <li key={cityIndex}>• {city}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Shipping Process */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">How Shipping Works</CardTitle>
            <CardDescription>
              Our simple 4-step shipping process ensures your items arrive safely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                  <CreditCard className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Order Confirmed</h3>
                <p className="text-sm text-gray-600">Payment processed and order confirmed</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Item Prepared</h3>
                <p className="text-sm text-gray-600">Items carefully packed and labeled</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                  <Truck className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. In Transit</h3>
                <p className="text-sm text-gray-600">Package shipped with tracking number</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">4. Delivered</h3>
                <p className="text-sm text-gray-600">Safe delivery to your address</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>📋 Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold">Processing Time</h4>
                <p className="text-sm text-gray-600">Orders are processed within 1-2 business days</p>
              </div>
              <div>
                <h4 className="font-semibold">Tracking</h4>
                <p className="text-sm text-gray-600">Tracking numbers sent via email once shipped</p>
              </div>
              <div>
                <h4 className="font-semibold">Delivery Attempts</h4>
                <p className="text-sm text-gray-600">Up to 3 delivery attempts before return to sender</p>
              </div>
              <div>
                <h4 className="font-semibold">Address Accuracy</h4>
                <p className="text-sm text-gray-600">Please ensure your address is complete and accurate</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💰 Shipping Costs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold">Free Shipping</h4>
                <p className="text-sm text-gray-600">Orders over Rp 200,000 get free standard shipping</p>
              </div>
              <div>
                <h4 className="font-semibold">Weight-Based</h4>
                <p className="text-sm text-gray-600">Shipping cost calculated by weight and distance</p>
              </div>
              <div>
                <h4 className="font-semibold">Multiple Items</h4>
                <p className="text-sm text-gray-600">Combined shipping for multiple items in one order</p>
              </div>
              <div>
                <h4 className="font-semibold">Remote Areas</h4>
                <p className="text-sm text-gray-600">Additional charges may apply for remote locations</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact for Shipping */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help with Shipping?</CardTitle>
            <CardDescription>
              Contact our customer service team for shipping-related questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <h4 className="font-semibold">📞 Phone</h4>
                <p className="text-sm text-gray-600">{settings.storePhone}</p>
              </div>
              <div>
                <h4 className="font-semibold">✉️ Email</h4>
                <p className="text-sm text-gray-600">{settings.supportEmail}</p>
              </div>
              <div>
                <h4 className="font-semibold">💬 Live Chat</h4>
                <p className="text-sm text-gray-600">{settings.businessHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
