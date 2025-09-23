import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Sparkles, Award } from 'lucide-react';

export default function QualityPage() {
  const qualitySteps = [
    {
      icon: Eye,
      title: 'Initial Inspection',
      description: 'Every item is carefully examined for defects, wear, and authenticity.',
      criteria: ['Fabric condition', 'Seam integrity', 'Hardware functionality', 'Brand authenticity']
    },
    {
      icon: Sparkles,
      title: 'Professional Cleaning',
      description: 'Items undergo thorough cleaning and sanitization processes.',
      criteria: ['Eco-friendly cleaning', 'Stain removal', 'Odor elimination', 'Fabric care']
    },
    {
      icon: Shield,
      title: 'Quality Grading',
      description: 'Items are graded based on condition and quality standards.',
      criteria: ['Excellent (A+)', 'Very Good (A)', 'Good (B+)', 'Fair (B)']
    },
    {
      icon: Award,
      title: 'Final Approval',
      description: 'Only items meeting our high standards make it to our store.',
      criteria: ['Quality assurance', 'Photo documentation', 'Accurate description', 'Fair pricing']
    }
  ];

  const qualityGrades = [
    {
      grade: 'A+',
      title: 'Excellent',
      description: 'Like new condition with no visible signs of wear',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    {
      grade: 'A',
      title: 'Very Good',
      description: 'Minimal signs of wear, excellent overall condition',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    {
      grade: 'B+',
      title: 'Good',
      description: 'Light wear but still in great condition',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    },
    {
      grade: 'B',
      title: 'Fair',
      description: 'Noticeable wear but still functional and stylish',
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Quality Promise</Badge>
          <h1 className="text-4xl font-bold mb-4">How We Ensure Item Quality</h1>
          <p className="text-lg text-muted-foreground">
            Our rigorous quality control process ensures you receive only the best pre-loved items
          </p>
        </div>

        <div className="space-y-8 mb-12">
          {qualitySteps.map((step, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                  <Badge variant="outline">Step {index + 1}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {step.criteria.map((criterion, idx) => (
                    <div key={idx} className="text-sm bg-muted p-2 rounded text-center">
                      {criterion}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quality Grading System</CardTitle>
            <CardDescription>
              We use a transparent grading system to help you understand the condition of each item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {qualityGrades.map((grade, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className={`px-3 py-1 rounded-full font-bold ${grade.color}`}>
                    {grade.grade}
                  </div>
                  <div>
                    <h3 className="font-semibold">{grade.title}</h3>
                    <p className="text-sm text-muted-foreground">{grade.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Quality Guarantee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm">30-day return policy</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm">Accurate condition descriptions</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm">Professional photography</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm">Customer satisfaction guarantee</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quality Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Customer Satisfaction</span>
                  <span className="font-bold text-green-600">98.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Return Rate</span>
                  <span className="font-bold text-blue-600">&lt; 2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Quality Grade A+ & A</span>
                  <span className="font-bold text-purple-600">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Items Inspected Daily</span>
                  <span className="font-bold text-orange-600">200+</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
