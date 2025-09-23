import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Truck, Heart } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Heart,
      title: 'Curated Selection',
      description: 'We carefully select high-quality pre-loved clothing items from trusted sources.',
      details: 'Our team inspects every item for quality, authenticity, and condition before adding it to our collection.'
    },
    {
      icon: CheckCircle,
      title: 'Quality Check',
      description: 'Each item undergoes thorough quality inspection and professional cleaning.',
      details: 'We ensure all items meet our quality standards and are ready for their new home.'
    },
    {
      icon: Package,
      title: 'Careful Packaging',
      description: 'Items are packaged with care using eco-friendly materials.',
      details: 'We use sustainable packaging materials to minimize environmental impact.'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery to your doorstep.',
      details: 'We partner with trusted delivery services to ensure your items arrive safely and on time.'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">How It Works</Badge>
          <h1 className="text-4xl font-bold mb-4">Our Thrifting Process</h1>
          <p className="text-lg text-muted-foreground">
            Discover how we bring you the best sustainable fashion pieces
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {steps.map((step, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{step.details}</p>
              </CardContent>
              <div className="absolute top-4 right-4">
                <Badge variant="outline">{index + 1}</Badge>
              </div>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle>Why Choose Thrift Fashion?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Sustainable</h3>
                <p className="text-sm text-muted-foreground">
                  Reduce fashion waste and environmental impact
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-2">Affordable</h3>
                <p className="text-sm text-muted-foreground">
                  Get quality fashion at fraction of retail prices
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-2">Unique</h3>
                <p className="text-sm text-muted-foreground">
                  Find one-of-a-kind pieces that express your style
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
