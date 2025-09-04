import { Wrench, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-8">
          <Wrench className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Under Maintenance</h1>
          <p className="text-muted-foreground">
            We're currently performing scheduled maintenance to improve your shopping experience. 
            Please check back shortly.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We apologize for any inconvenience and appreciate your patience.
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
