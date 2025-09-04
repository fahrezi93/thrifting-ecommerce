import { Store, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function StoreClosedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-8">
          <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Store Temporarily Closed</h1>
          <p className="text-muted-foreground">
            Our store is currently closed. We're working to reopen as soon as possible.
            Thank you for your understanding.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please check back later or contact us for more information.
          </p>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
