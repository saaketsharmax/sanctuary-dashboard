'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface MatchPageProps {
  params: Promise<{ id: string }>
}

export default function PartnerMatchDetailPage({ params }: MatchPageProps) {
  const { id } = use(params)

  // No mock data - show not found state
  return (
    <div className="space-y-6">
      <Link href="/partner/matches">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Matches
        </Button>
      </Link>

      <Card>
        <CardContent className="py-16">
          <div className="text-center">
            <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Match Not Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              This match does not exist or you don&apos;t have access to view it.
            </p>
            <Link href="/partner/matches">
              <Button>Return to Matches</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
