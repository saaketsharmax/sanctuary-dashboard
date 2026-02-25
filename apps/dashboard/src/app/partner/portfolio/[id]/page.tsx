'use client'

import { Button, Card, CardContent } from '@sanctuary/ui'
import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Briefcase } from 'lucide-react'
interface StartupPageProps {
  params: Promise<{ id: string }>
}

export default function PartnerStartupDetailPage({ params }: StartupPageProps) {
  const { id } = use(params)

  // No mock data - show coming soon state
  return (
    <div className="space-y-6">
      <Link href="/partner/portfolio">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Portfolio
        </Button>
      </Link>

      <Card>
        <CardContent className="py-16">
          <div className="text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Startup Not Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              This startup does not exist or you don&apos;t have access to view it.
            </p>
            <Link href="/partner/portfolio">
              <Button>Return to Portfolio</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
