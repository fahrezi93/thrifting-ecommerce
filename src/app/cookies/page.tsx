'use client'

import { motion } from 'framer-motion'
import { Cookie, Settings, BarChart3, Target, Shield, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Cookie className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            This policy explains how we use cookies and similar technologies to enhance your browsing experience.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: October 2025
          </p>
        </div>

        <div className="grid gap-8 max-w-4xl mx-auto">
          {/* What are Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                What are Cookies?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Cookies are small text files that are stored on your device when you visit our website. They help us 
                provide you with a better browsing experience by remembering your preferences and analyzing how you use our site.
              </p>
              <p className="text-muted-foreground">
                We use both session cookies (which expire when you close your browser) and persistent cookies 
                (which remain on your device for a set period or until you delete them).
              </p>
            </CardContent>
          </Card>

          {/* Types of Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Essential Cookies */}
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <h4 className="font-semibold">Essential Cookies</h4>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-muted-foreground text-sm mb-2">
                  These cookies are necessary for the website to function properly and cannot be disabled.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Authentication and security</li>
                  <li>Shopping cart functionality</li>
                  <li>Form submission and validation</li>
                  <li>Load balancing and performance</li>
                </ul>
              </div>

              {/* Analytics Cookies */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <h4 className="font-semibold">Analytics Cookies</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-muted-foreground text-sm mb-2">
                  These cookies help us understand how visitors interact with our website.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Page views and user behavior</li>
                  <li>Traffic sources and referrals</li>
                  <li>Popular products and pages</li>
                  <li>Site performance metrics</li>
                </ul>
              </div>

              {/* Marketing Cookies */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  <h4 className="font-semibold">Marketing Cookies</h4>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-muted-foreground text-sm mb-2">
                  These cookies are used to show you relevant advertisements and measure campaign effectiveness.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Personalized advertisements</li>
                  <li>Social media integration</li>
                  <li>Retargeting campaigns</li>
                  <li>Conversion tracking</li>
                </ul>
              </div>

              {/* Preference Cookies */}
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-5 w-5 text-orange-500" />
                  <h4 className="font-semibold">Preference Cookies</h4>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-muted-foreground text-sm mb-2">
                  These cookies remember your preferences and settings to enhance your experience.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Language and region settings</li>
                  <li>Theme preferences (light/dark mode)</li>
                  <li>Currency and display options</li>
                  <li>Accessibility settings</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We may also use third-party services that set their own cookies. These services help us provide 
                better functionality and analyze our website performance.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Google Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    Helps us understand website usage and improve user experience.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Payment Processors</h4>
                  <p className="text-sm text-muted-foreground">
                    Secure payment processing and fraud prevention.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Social Media</h4>
                  <p className="text-sm text-muted-foreground">
                    Social sharing buttons and embedded content.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Customer Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Live chat and help desk functionality.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Managing Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Managing Your Cookie Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You have control over which cookies you accept. Here are your options:
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Browser Settings</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Most browsers allow you to control cookies through their settings. You can:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Block all cookies</li>
                    <li>Block third-party cookies only</li>
                    <li>Delete existing cookies</li>
                    <li>Set cookies to expire when you close your browser</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Cookie Consent Banner</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    When you first visit our site, you can choose which types of cookies to accept through our consent banner.
                  </p>
                  <Button variant="outline" size="sm">
                    Update Cookie Preferences
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact of Disabling Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Impact of Disabling Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                While you can disable cookies, please note that this may affect your browsing experience:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">Without Essential Cookies</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Cannot log in to your account</li>
                    <li>Shopping cart won't work</li>
                    <li>Cannot complete purchases</li>
                    <li>Security features disabled</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-orange-600">Without Optional Cookies</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Less personalized experience</li>
                    <li>Preferences not remembered</li>
                    <li>Less relevant advertisements</li>
                    <li>Limited analytics insights</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updates to Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. 
                We will notify you of any significant changes by posting the updated policy on our website with a new "Last updated" date.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Questions About Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have any questions about our use of cookies, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> privacy@thrifthaven.com</p>
                <p><strong>Phone:</strong> +62 123 456 7890</p>
                <p><strong>Address:</strong> Jakarta, Indonesia</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
