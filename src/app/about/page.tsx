'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Recycle, Users, Shield } from 'lucide-react'
import { useStoreSettings } from '@/hooks/use-store-settings'

export default function AboutPage() {
  const { settings, loading } = useStoreSettings()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Thrift Haven</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your trusted destination for high-quality pre-loved fashion. We believe in sustainable style 
          that doesn't compromise on quality or affordability.
        </p>
      </div>

      {/* Mission Section */}
      <div className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-lg leading-relaxed">
              At Thrift Haven, we're passionate about making fashion more sustainable and accessible. 
              We carefully curate pre-loved clothing and accessories, giving them a second life while 
              helping you discover unique pieces at incredible prices. Every purchase you make contributes 
              to reducing textile waste and promoting a circular fashion economy.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Recycle className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Sustainability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Reducing fashion waste by giving clothes a second life and promoting circular economy.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Every item is carefully inspected and curated to ensure you get the best quality pieces.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Community</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Building a community of conscious consumers who value sustainable fashion choices.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Trust</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Transparent descriptions, authentic photos, and reliable service you can count on.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Our Story</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Founded in 2024, Thrift Haven started as a small passion project to make sustainable 
              fashion more accessible to everyone. We noticed that many beautiful, high-quality 
              pieces were being discarded while people struggled to find affordable, stylish clothing.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, we've grown into a trusted platform that connects conscious consumers with 
              carefully curated pre-loved fashion. Every item tells a story, and we're here to 
              help you write the next chapter.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Why Choose Thrift Haven?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Carefully curated selection of high-quality pre-loved items</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Detailed condition descriptions and authentic photos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Affordable prices without compromising on style</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Secure payment and reliable shipping</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Contributing to a more sustainable fashion future</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Contact Section */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Get in Touch</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Have questions or want to learn more about our mission? We'd love to hear from you!
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> {settings.storeEmail}</p>
            <p><strong>Phone:</strong> {settings.storePhone}</p>
            <p><strong>Address:</strong> {settings.storeAddress}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
