import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Recycle, Globe, Heart } from 'lucide-react';

export default function SustainabilityPage() {
  const initiatives = [
    {
      icon: Recycle,
      title: 'Circular Fashion',
      description: 'Extending the lifecycle of clothing through resale and reuse.',
      impact: '85% reduction in textile waste'
    },
    {
      icon: Leaf,
      title: 'Eco-Friendly Packaging',
      description: 'Using biodegradable and recycled materials for all shipments.',
      impact: '100% sustainable packaging'
    },
    {
      icon: Globe,
      title: 'Carbon Footprint',
      description: 'Reducing emissions through local sourcing and efficient logistics.',
      impact: '60% lower carbon footprint'
    },
    {
      icon: Heart,
      title: 'Community Impact',
      description: 'Supporting local communities and promoting conscious consumption.',
      impact: '1000+ families supported'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Sustainability</Badge>
          <h1 className="text-4xl font-bold mb-4">Our Environmental Commitment</h1>
          <p className="text-lg text-muted-foreground">
            Building a more sustainable future through conscious fashion choices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {initiatives.map((initiative, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                    <initiative.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{initiative.title}</CardTitle>
                    <CardDescription>{initiative.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Impact: {initiative.impact}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>The Fashion Industry Challenge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The fashion industry is one of the world's largest polluters, responsible for 10% of global carbon emissions 
                and 20% of wastewater. Fast fashion has created a culture of disposable clothing, where items are worn 
                only a few times before being discarded.
              </p>
              <p className="text-muted-foreground">
                By choosing thrift fashion, you're part of the solution. Every pre-loved item you purchase helps reduce 
                demand for new production and keeps clothing out of landfills.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Sustainability Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">2025 Goal</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">10,000</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Items Saved from Landfills</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">Carbon Neutral</h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">2026</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Net Zero Operations</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Community</h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">5,000</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Families Supported</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
