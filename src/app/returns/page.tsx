'use client'

import { ArrowLeft, CheckCircle, XCircle, Clock, Package, RefreshCw, CreditCard } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const returnReasons = [
  "Item doesn't fit",
  "Item not as described",
  "Wrong item received",
  "Item damaged during shipping",
  "Changed my mind",
  "Quality issues"
]

const returnProcess = [
  {
    step: 1,
    title: "Request Return",
    description: "Contact us within 14 days of delivery",
    icon: Package,
    color: "blue"
  },
  {
    step: 2,
    title: "Get Approval",
    description: "We'll review and approve your return request",
    icon: CheckCircle,
    color: "green"
  },
  {
    step: 3,
    title: "Ship Item Back",
    description: "Pack and send the item back to us",
    icon: ArrowLeft,
    color: "purple"
  },
  {
    step: 4,
    title: "Receive Refund",
    description: "Get your money back within 3-7 business days",
    icon: CreditCard,
    color: "orange"
  }
]

export default function Returns() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Returns & Exchanges</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Easy returns within 14 days. We want you to love your thrift finds!
          </p>
        </div>

        {/* Return Policy Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <RefreshCw className="h-6 w-6 mr-2 text-blue-500" />
              Return Policy Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mx-auto mb-3 p-3 bg-green-100 rounded-full w-fit">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">14-Day Window</h3>
                <p className="text-sm text-gray-600">Return items within 14 days of delivery</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 p-3 bg-blue-100 rounded-full w-fit">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Original Condition</h3>
                <p className="text-sm text-gray-600">Items must be unworn with tags attached</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 p-3 bg-purple-100 rounded-full w-fit">
                  <CreditCard className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Full Refund</h3>
                <p className="text-sm text-gray-600">Get your money back, no questions asked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Return Process */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Return Items</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {returnProcess.map((step) => {
              const IconComponent = step.icon
              return (
                <Card key={step.step} className="relative">
                  <CardHeader className="text-center">
                    <div className={`mx-auto mb-4 p-3 bg-${step.color}-100 rounded-full w-fit`}>
                      <IconComponent className={`h-8 w-8 text-${step.color}-600`} />
                    </div>
                    <Badge variant="secondary" className="absolute top-4 right-4">
                      Step {step.step}
                    </Badge>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 text-center">{step.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* What Can Be Returned */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                What Can Be Returned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Items in original condition with tags attached</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Unworn clothing and accessories</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Items returned within 14 days of delivery</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Items with original packaging when applicable</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Defective or damaged items</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* What Cannot Be Returned */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <XCircle className="h-5 w-5 mr-2" />
                What Cannot Be Returned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Items worn or used</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Items without original tags</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Items returned after 14 days</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Undergarments and swimwear</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Items marked as "Final Sale"</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Common Return Reasons */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Common Return Reasons</CardTitle>
            <CardDescription>
              We accept returns for various reasons. Select the most appropriate one when requesting a return.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {returnReasons.map((reason, index) => (
                <Badge key={index} variant="outline" className="p-3 justify-center">
                  {reason}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Return Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Return Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">1. Contact Customer Service</h3>
              <p className="text-sm text-gray-600 mb-2">
                Email us at <strong>returns@thrifthaven.com</strong> or call <strong>+62 21 1234 5678</strong>
              </p>
              <p className="text-sm text-gray-600">
                Include your order number, item(s) to return, and reason for return.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Prepare Your Package</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ensure items are clean and in original condition</li>
                <li>• Include all original tags and packaging</li>
                <li>• Pack items securely to prevent damage</li>
                <li>• Include a copy of your order confirmation</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Shipping Address</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm font-mono">
                  Thrift Haven Returns<br/>
                  Jl. Sudirman No. 123<br/>
                  Jakarta Pusat 10220<br/>
                  Indonesia
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Return Shipping</h3>
              <p className="text-sm text-gray-600">
                Customers are responsible for return shipping costs unless the item was defective or incorrect.
                We recommend using a trackable shipping method.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Refund Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>💰 Refund Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold">Processing Time</h4>
                <p className="text-sm text-gray-600">1-2 business days after we receive your return</p>
              </div>
              <div>
                <h4 className="font-semibold">Refund Method</h4>
                <p className="text-sm text-gray-600">Refunded to original payment method</p>
              </div>
              <div>
                <h4 className="font-semibold">Bank Processing</h4>
                <p className="text-sm text-gray-600">3-7 business days for funds to appear</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔄 Exchanges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold">Size Exchanges</h4>
                <p className="text-sm text-gray-600">Free exchanges for different sizes (subject to availability)</p>
              </div>
              <div>
                <h4 className="font-semibold">Color/Style Changes</h4>
                <p className="text-sm text-gray-600">Return original item and place new order</p>
              </div>
              <div>
                <h4 className="font-semibold">Exchange Process</h4>
                <p className="text-sm text-gray-600">Contact us to arrange exchanges</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Alerts */}
        <div className="space-y-4 mb-8">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Quality Guarantee:</strong> If you receive a damaged or defective item, we'll cover return shipping and provide a full refund or replacement.
            </AlertDescription>
          </Alert>

          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Holiday Returns:</strong> Items purchased during holiday periods have extended return windows. Check your order confirmation for specific dates.
            </AlertDescription>
          </Alert>
        </div>

        {/* Contact for Returns */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help with Returns?</CardTitle>
            <CardDescription>
              Our customer service team is here to help with any return questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <h4 className="font-semibold mb-2">📧 Email</h4>
                <p className="text-sm text-gray-600">returns@thrifthaven.com</p>
                <p className="text-xs text-gray-500">Response within 24 hours</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold mb-2">📞 Phone</h4>
                <p className="text-sm text-gray-600">+62 21 1234 5678</p>
                <p className="text-xs text-gray-500">Mon-Fri, 9 AM - 6 PM</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold mb-2">💬 Live Chat</h4>
                <p className="text-sm text-gray-600">Available on website</p>
                <p className="text-xs text-gray-500">9 AM - 9 PM daily</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Button asChild>
                <a href="/help-center">Visit Help Center</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
