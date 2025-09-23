import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary/20">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Page Not Found</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What can you do?</CardTitle>
            <CardDescription>Here are some helpful links to get you back on track</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button asChild variant="default" className="h-auto p-4">
                <Link href="/" className="flex flex-col items-center gap-2">
                  <Home className="h-6 w-6" />
                  <span className="font-medium">Go Home</span>
                  <span className="text-xs opacity-75">Return to homepage</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/products" className="flex flex-col items-center gap-2">
                  <ShoppingBag className="h-6 w-6" />
                  <span className="font-medium">Browse Products</span>
                  <span className="text-xs opacity-75">Explore our collection</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/categories" className="flex flex-col items-center gap-2">
                  <Search className="h-6 w-6" />
                  <span className="font-medium">Categories</span>
                  <span className="text-xs opacity-75">Find by category</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/help-center" className="flex flex-col items-center gap-2">
                  <ArrowLeft className="h-6 w-6" />
                  <span className="font-medium">Get Help</span>
                  <span className="text-xs opacity-75">Visit help center</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-sm text-muted-foreground">
          <p>
            If you believe this is an error, please{' '}
            <Link href="/contact" className="text-primary hover:underline">
              contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
