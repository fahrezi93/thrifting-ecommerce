'use client'

import { useState } from 'react'
import { Ruler, User, Shirt, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useStoreSettings } from '@/hooks/use-store-settings'

const womenSizes = {
  tops: [
    { size: 'XS', bust: '81-84', waist: '61-64', hip: '86-89' },
    { size: 'S', bust: '86-89', waist: '66-69', hip: '91-94' },
    { size: 'M', bust: '91-94', waist: '71-74', hip: '96-99' },
    { size: 'L', bust: '96-99', waist: '76-79', hip: '101-104' },
    { size: 'XL', bust: '101-104', waist: '81-84', hip: '106-109' },
    { size: 'XXL', bust: '106-109', waist: '86-89', hip: '111-114' }
  ],
  bottoms: [
    { size: 'XS', waist: '61-64', hip: '86-89', inseam: '76' },
    { size: 'S', waist: '66-69', hip: '91-94', inseam: '76' },
    { size: 'M', waist: '71-74', hip: '96-99', inseam: '78' },
    { size: 'L', waist: '76-79', hip: '101-104', inseam: '78' },
    { size: 'XL', waist: '81-84', hip: '106-109', inseam: '80' },
    { size: 'XXL', waist: '86-89', hip: '111-114', inseam: '80' }
  ],
  dresses: [
    { size: 'XS', bust: '81-84', waist: '61-64', hip: '86-89', length: '91-94' },
    { size: 'S', bust: '86-89', waist: '66-69', hip: '91-94', length: '94-97' },
    { size: 'M', bust: '91-94', waist: '71-74', hip: '96-99', length: '97-100' },
    { size: 'L', bust: '96-99', waist: '76-79', hip: '101-104', length: '100-103' },
    { size: 'XL', bust: '101-104', waist: '81-84', hip: '106-109', length: '103-106' },
    { size: 'XXL', bust: '106-109', waist: '86-89', hip: '111-114', length: '106-109' }
  ]
}

const menSizes = {
  tops: [
    { size: 'XS', chest: '86-89', waist: '71-74', neck: '35-36' },
    { size: 'S', chest: '91-94', waist: '76-79', neck: '37-38' },
    { size: 'M', chest: '96-99', waist: '81-84', neck: '39-40' },
    { size: 'L', chest: '101-106', waist: '86-91', neck: '41-42' },
    { size: 'XL', chest: '111-116', waist: '96-101', neck: '43-44' },
    { size: 'XXL', chest: '121-126', waist: '106-111', neck: '45-46' }
  ],
  bottoms: [
    { size: 'XS', waist: '71-74', hip: '86-89', inseam: '81' },
    { size: 'S', waist: '76-79', hip: '91-94', inseam: '81' },
    { size: 'M', waist: '81-84', hip: '96-99', inseam: '83' },
    { size: 'L', waist: '86-91', hip: '101-106', inseam: '83' },
    { size: 'XL', waist: '96-101', hip: '111-116', inseam: '85' },
    { size: 'XXL', waist: '106-111', hip: '121-126', inseam: '85' }
  ]
}

const shoeSizes = [
  { eu: '35', us: '5', uk: '2.5', cm: '22.5' },
  { eu: '36', us: '6', uk: '3.5', cm: '23' },
  { eu: '37', us: '6.5', uk: '4', cm: '23.5' },
  { eu: '38', us: '7.5', uk: '5', cm: '24' },
  { eu: '39', us: '8', uk: '5.5', cm: '24.5' },
  { eu: '40', us: '9', uk: '6.5', cm: '25' },
  { eu: '41', us: '9.5', uk: '7', cm: '25.5' },
  { eu: '42', us: '10.5', uk: '8', cm: '26' },
  { eu: '43', us: '11', uk: '8.5', cm: '26.5' },
  { eu: '44', us: '12', uk: '9.5', cm: '27' },
  { eu: '45', us: '12.5', uk: '10', cm: '27.5' },
  { eu: '46', us: '13.5', uk: '11', cm: '28' }
]

const measurementTips = [
  {
    title: "Bust/Chest",
    description: "Measure around the fullest part of your chest, keeping the tape parallel to the floor"
  },
  {
    title: "Waist",
    description: "Measure around your natural waistline, which is the narrowest part of your torso"
  },
  {
    title: "Hip",
    description: "Measure around the fullest part of your hips, about 8 inches below your waist"
  },
  {
    title: "Inseam",
    description: "Measure from the crotch seam to the bottom of the leg along the inner seam"
  },
  {
    title: "Neck",
    description: "Measure around the base of your neck where a collar would sit"
  }
]

export default function SizeGuide() {
  const { settings, loading } = useStoreSettings()
  const [selectedGender, setSelectedGender] = useState<'women' | 'men'>('women')

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Size Guide</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find your perfect fit with our comprehensive sizing charts and measurement guide
          </p>
        </div>

        {/* How to Measure */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Ruler className="h-6 w-6 mr-2 text-blue-500" />
              How to Measure Yourself
            </CardTitle>
            <CardDescription>
              For the most accurate fit, measure yourself with a soft measuring tape
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {measurementTips.map((tip, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">{tip.title}</h3>
                  <p className="text-sm text-blue-700">{tip.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>💡 Pro Tip:</strong> Measure over your undergarments for the most accurate fit. 
                If you're between sizes, we recommend sizing up for a more comfortable fit.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Size Charts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Clothing Size Charts</CardTitle>
            <CardDescription>All measurements are in centimeters (cm)</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedGender} onValueChange={(value: string) => setSelectedGender(value as 'women' | 'men')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="women" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Women's Sizes
                </TabsTrigger>
                <TabsTrigger value="men" className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Men's Sizes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="women">
                <div className="space-y-8">
                  {/* Women's Tops */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Shirt className="h-5 w-5 mr-2" />
                      Tops & Blouses
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">Size</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Bust (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Waist (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Hip (cm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {womenSizes.tops.map((size, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 font-semibold">{size.size}</td>
                              <td className="border border-gray-300 px-4 py-2">{size.bust}</td>
                              <td className="border border-gray-300 px-4 py-2">{size.waist}</td>
                              <td className="border border-gray-300 px-4 py-2">{size.hip}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Women's Bottoms */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Bottoms & Pants</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">Size</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Waist (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Hip (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Inseam (cm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {womenSizes.bottoms.map((size, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 font-semibold">{size.size}</td>
                              <td className="border border-gray-300 px-4 py-2">{size.waist}</td>
                              <td className="border border-gray-300 px-4 py-2">{size.hip}</td>
                              <td className="border border-gray-300 px-4 py-2">{size.inseam}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Women's Dresses */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Dresses</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">Size</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Bust (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Waist (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Hip (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Length (cm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {womenSizes.dresses.map((size, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 font-semibold">{size.size}</td>
                              <td className="border border-gray-300 px-4 py-2">{size.bust}</td>
                              <td className="border border-gray-300 px-4 py-2">{size.waist}</td>
                              <td className="border border-gray-300 px-4 py-2">{size.hip}</td>
                              <td className="border border-gray-300 px-4 py-2">{size.length}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="men">
                <div className="space-y-8">
                  {/* Men's Tops */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Shirt className="h-5 w-5 mr-2" />
                      Shirts & Tops
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">Size</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Chest (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Waist (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Neck (cm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {menSizes.tops.map((size, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 font-semibold">{size.size}</td>
                              <td className="border border-gray-300 px-4 py-2">{size.chest}</td>
                              <td className="border border-gray-300 px-4 py-2">{size.waist}</td>
                              <td className="border border-gray-300 px-4 py-2">{size.neck}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Men's Bottoms */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Pants & Trousers</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">Size</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Waist (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Hip (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Inseam (cm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {menSizes.bottoms.map((size, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 font-semibold">{size.size}</td>
                              <td className="border border-gray-300 px-4 py-2">{size.waist}</td>
                              <td className="border border-gray-300 px-4 py-2">{size.hip}</td>
                              <td className="border border-gray-300 px-4 py-2">{size.inseam}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Shoe Size Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Shoe Size Chart</CardTitle>
            <CardDescription>International shoe size conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">EU</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">US</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">UK</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">CM</th>
                  </tr>
                </thead>
                <tbody>
                  {shoeSizes.map((size, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-semibold">{size.eu}</td>
                      <td className="border border-gray-300 px-4 py-2">{size.us}</td>
                      <td className="border border-gray-300 px-4 py-2">{size.uk}</td>
                      <td className="border border-gray-300 px-4 py-2">{size.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Fit Guide */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>👕 Fit Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge variant="secondary" className="mb-2">Slim Fit</Badge>
                <p className="text-sm text-gray-600">Close-fitting, follows body contours</p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Regular Fit</Badge>
                <p className="text-sm text-gray-600">Standard fit with comfortable room</p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Relaxed Fit</Badge>
                <p className="text-sm text-gray-600">Loose, comfortable fit with extra room</p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Oversized</Badge>
                <p className="text-sm text-gray-600">Intentionally large, trendy loose fit</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📏 Sizing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <p className="text-sm">Check item descriptions for specific measurements</p>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <p className="text-sm">Consider the fabric - stretchy materials are more forgiving</p>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <p className="text-sm">When in doubt, size up for comfort</p>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <p className="text-sm">Check our return policy for easy exchanges</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact for Sizing Help */}
        <Card>
          <CardHeader>
            <CardTitle>Need Sizing Help?</CardTitle>
            <CardDescription>
              Still unsure about sizing? Our team is here to help you find the perfect fit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <h4 className="font-semibold mb-2">💬 Live Chat</h4>
                <p className="text-sm text-gray-600">Get instant sizing advice</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📧 Email</h4>
                <p className="text-sm text-gray-600">{settings.supportEmail}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📞 Phone</h4>
                <p className="text-sm text-gray-600">{settings.storePhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
