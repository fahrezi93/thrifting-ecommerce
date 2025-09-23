'use client';

import { ContainerTextFlip } from '@/components/ui/container-text-flip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TextFlipDemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Container Text Flip Demo</h1>
          <p className="text-lg text-muted-foreground">
            Showcase berbagai implementasi Container Text Flip dari shadcn.io
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Default Style */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Default Style
                <Badge variant="default">Original</Badge>
              </CardTitle>
              <CardDescription>
                Container Text Flip dengan styling default dari shadcn.io
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <ContainerTextFlip
                words={["better", "modern", "awesome", "beautiful"]}
                interval={2500}
                animationDuration={600}
                className="text-2xl md:text-4xl"
              />
            </CardContent>
          </Card>

          {/* Hero Style - Like Homepage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Hero Style
                <Badge variant="secondary">Homepage</Badge>
              </CardTitle>
              <CardDescription>
                Style yang digunakan di Hero Section homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <ContainerTextFlip
                words={["Sustainable", "Affordable", "Unique", "Quality", "Vintage"]}
                interval={2500}
                animationDuration={600}
                className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent border-0 shadow-none bg-transparent dark:bg-transparent"
                textClassName="text-primary"
              />
            </CardContent>
          </Card>

          {/* E-commerce Focus */}
          <Card>
            <CardHeader>
              <CardTitle>E-commerce Focus</CardTitle>
              <CardDescription>
                Kata-kata yang fokus pada e-commerce dan thrifting
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <ContainerTextFlip
                words={["Shop", "Discover", "Find", "Buy", "Explore"]}
                interval={2000}
                animationDuration={500}
                className="text-3xl md:text-5xl font-bold text-primary"
              />
            </CardContent>
          </Card>

          {/* Fast Animation */}
          <Card>
            <CardHeader>
              <CardTitle>Fast Animation</CardTitle>
              <CardDescription>
                Animasi yang lebih cepat dengan interval pendek
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <ContainerTextFlip
                words={["Quick", "Fast", "Rapid", "Swift"]}
                interval={1500}
                animationDuration={400}
                className="text-2xl md:text-3xl font-semibold"
              />
            </CardContent>
          </Card>

          {/* Thrift Theme */}
          <Card>
            <CardHeader>
              <CardTitle>Thrift Theme</CardTitle>
              <CardDescription>
                Kata-kata yang berhubungan dengan thrift dan sustainability
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <ContainerTextFlip
                words={["Thrift", "Recycle", "Reuse", "Sustainable", "Eco-friendly"]}
                interval={3000}
                animationDuration={700}
                className="text-2xl md:text-4xl font-bold text-green-600 dark:text-green-400"
              />
            </CardContent>
          </Card>

          {/* Custom Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Colors</CardTitle>
              <CardDescription>
                Container dengan warna kustom dan gradient
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <ContainerTextFlip
                words={["Colorful", "Vibrant", "Bright", "Bold"]}
                interval={2200}
                animationDuration={600}
                className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              />
            </CardContent>
          </Card>
        </div>

        {/* Full Width Example */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Full Width Hero Example</CardTitle>
            <CardDescription className="text-center">
              Contoh penggunaan di hero section dengan layout lengkap
            </CardDescription>
          </CardHeader>
          <CardContent className="py-12">
            <div className="text-center space-y-6">
              <div className="text-4xl md:text-6xl font-bold leading-tight">
                <div className="mb-4">Discover</div>
                <ContainerTextFlip
                  words={["Sustainable", "Affordable", "Unique", "Quality", "Vintage"]}
                  interval={2500}
                  animationDuration={600}
                  className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent border-0 shadow-none bg-transparent dark:bg-transparent"
                  textClassName="text-primary"
                />
                <div className="mt-4">Fashion for Everyone</div>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience the power of animated text that smoothly transitions between words
                with dynamic width animations and letter-by-letter reveals.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle>Container Text Flip Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-2">
                <li>✨ Dynamic width animations</li>
                <li>🎨 Letter-by-letter blur reveals</li>
                <li>⚡ Configurable timing and duration</li>
                <li>🎯 TypeScript support</li>
              </ul>
              <ul className="space-y-2">
                <li>🌙 Dark mode compatible</li>
                <li>📱 Responsive design</li>
                <li>🎪 Smooth layout transitions</li>
                <li>🔧 Highly customizable</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Container Text Flip menggunakan <strong>Framer Motion</strong> untuk animasi yang smooth
          </p>
          <p>
            Perfect untuk hero sections, taglines, dan highlight text
          </p>
        </div>
      </div>
    </div>
  );
}
