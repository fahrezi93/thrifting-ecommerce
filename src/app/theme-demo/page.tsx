'use client';

import { ThemeToggleButton } from '@/components/ui/theme-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ThemeDemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Theme Toggle Demo</h1>
          <p className="text-lg text-muted-foreground">
            Test berbagai variasi theme toggle button dengan animasi Circle Blur
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Circle Blur - Center */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Circle Blur - Center
                <Badge variant="default">Default</Badge>
              </CardTitle>
              <CardDescription>
                Animasi circle blur yang dimulai dari tengah dengan efek blur
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ThemeToggleButton 
                variant="circle-blur" 
                start="center"
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
            </CardContent>
          </Card>

          {/* Circle - Center */}
          <Card>
            <CardHeader>
              <CardTitle>Circle - Center</CardTitle>
              <CardDescription>
                Animasi circle standar tanpa blur effect
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ThemeToggleButton 
                variant="circle" 
                start="center"
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
            </CardContent>
          </Card>

          {/* Circle Blur - Top Left */}
          <Card>
            <CardHeader>
              <CardTitle>Circle Blur - Top Left</CardTitle>
              <CardDescription>
                Animasi dimulai dari pojok kiri atas
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ThemeToggleButton 
                variant="circle-blur" 
                start="top-left"
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
            </CardContent>
          </Card>

          {/* Circle Blur - Bottom Right */}
          <Card>
            <CardHeader>
              <CardTitle>Circle Blur - Bottom Right</CardTitle>
              <CardDescription>
                Animasi dimulai dari pojok kanan bawah
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ThemeToggleButton 
                variant="circle-blur" 
                start="bottom-right"
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
            </CardContent>
          </Card>

          {/* Polygon */}
          <Card>
            <CardHeader>
              <CardTitle>Polygon Wipe</CardTitle>
              <CardDescription>
                Animasi wipe dengan efek polygon
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ThemeToggleButton 
                variant="polygon" 
                start="center"
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
            </CardContent>
          </Card>

          {/* With Label */}
          <Card>
            <CardHeader>
              <CardTitle>With Label</CardTitle>
              <CardDescription>
                Theme toggle dengan label text
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ThemeToggleButton 
                variant="circle-blur" 
                start="center"
                showLabel={true}
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✨ View Transitions API untuk animasi smooth</li>
              <li>🎨 Multiple animation variants (circle, circle-blur, polygon)</li>
              <li>📍 Flexible positioning (center, corners)</li>
              <li>🎯 TypeScript support dengan interface lengkap</li>
              <li>♿ Accessible dengan ARIA labels</li>
              <li>📱 Responsive design</li>
              <li>🔄 Automatic fallback untuk browser tanpa View Transitions</li>
              <li>⚡ Performance optimized dengan dynamic CSS injection</li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Theme toggle menggunakan <strong>next-themes</strong> dan <strong>View Transitions API</strong>
          </p>
          <p>
            Animasi circle-blur memberikan efek visual yang smooth dan modern
          </p>
        </div>
      </div>
    </div>
  );
}
