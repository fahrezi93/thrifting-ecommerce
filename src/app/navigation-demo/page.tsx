'use client';

import { MainNavigation } from '@/components/layout/main-navigation';
import { MobileNavigation } from '@/components/layout/mobile-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function NavigationDemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Shadcn Navigation Menu Demo</h1>
          <p className="text-lg text-muted-foreground">
            Advanced navigation components for e-commerce thrifting website
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Desktop Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Desktop Navigation
                <Badge variant="default">Main</Badge>
              </CardTitle>
              <CardDescription>
                Advanced navigation menu with dropdowns and mega menus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <MainNavigation />
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Features:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Hover-activated mega menus</li>
                  <li>Organized category sections</li>
                  <li>Rich content with icons and descriptions</li>
                  <li>Keyboard navigation support</li>
                  <li>Smooth animations and transitions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Mobile Navigation
                <Badge variant="secondary">Mobile</Badge>
              </CardTitle>
              <CardDescription>
                Collapsible navigation optimized for mobile devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/30 max-h-96 overflow-y-auto">
                <MobileNavigation onClose={() => {}} />
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Features:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Expandable category sections</li>
                  <li>Touch-optimized interactions</li>
                  <li>Smooth expand/collapse animations</li>
                  <li>Hierarchical content organization</li>
                  <li>Icon-based visual hierarchy</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Structure */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Structure</CardTitle>
            <CardDescription>
              Organized content hierarchy for e-commerce thrifting website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Clothing */}
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">👕 Clothing</h4>
                <div className="space-y-2 text-sm">
                  <div>T-Shirts</div>
                  <div>Shirts</div>
                  <div>Hoodies & Sweaters</div>
                  <div>Jackets</div>
                  <div>Dresses</div>
                  <div>Blouses</div>
                </div>
              </div>

              {/* Pants */}
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">👖 Pants</h4>
                <div className="space-y-2 text-sm">
                  <div>Jeans</div>
                  <div>Long Pants</div>
                  <div>Shorts</div>
                  <div>Cargo Pants</div>
                  <div>Wide Pants</div>
                  <div>Skirts</div>
                </div>
              </div>

              {/* Shoes */}
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">👟 Shoes</h4>
                <div className="space-y-2 text-sm">
                  <div>Sneakers</div>
                  <div>Boots</div>
                  <div>Heels</div>
                  <div>Flats</div>
                  <div>Sandals</div>
                  <div>Sports Shoes</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Technical Features */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle>Technical Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Desktop Navigation</h4>
                <ul className="text-sm space-y-1">
                  <li>✨ Radix UI NavigationMenu primitives</li>
                  <li>🎨 Tailwind CSS styling</li>
                  <li>⌨️ Full keyboard navigation</li>
                  <li>🎪 Smooth hover delays</li>
                  <li>📱 Responsive design</li>
                  <li>🌙 Dark mode compatible</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Mobile Navigation</h4>
                <ul className="text-sm space-y-1">
                  <li>📱 Touch-optimized interactions</li>
                  <li>🎭 Framer Motion animations</li>
                  <li>📂 Expandable sections</li>
                  <li>🎯 Icon-based visual hierarchy</li>
                  <li>⚡ Performance optimized</li>
                  <li>♿ Accessibility focused</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Usage in E-commerce</CardTitle>
            <CardDescription>
              How this navigation improves user experience for thrifting website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h5 className="font-medium text-primary">Content Discovery</h5>
                <p className="text-muted-foreground">
                  Organized categories help users find specific items quickly without overwhelming them with choices.
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium text-primary">Visual Hierarchy</h5>
                <p className="text-muted-foreground">
                  Icons and descriptions provide context, making navigation intuitive for first-time visitors.
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium text-primary">Mobile Experience</h5>
                <p className="text-muted-foreground">
                  Collapsible sections work perfectly on mobile, providing full navigation without taking up screen space.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Navigation Menu menggunakan <strong>Radix UI</strong> dan <strong>Tailwind CSS</strong>
          </p>
          <p>
            Perfect untuk e-commerce websites dengan complex product hierarchies
          </p>
        </div>
      </div>
    </div>
  );
}
