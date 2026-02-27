'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
interface MentorPageProps {
  params: Promise<{ id: string }>
}

export default function PartnerMentorDetailPage({ params }: MentorPageProps) {
  const { id } = use(params)

  // No mock data - show not found state
  return (
    <div className="space-y-6">
      <Link href="/partner/mentors">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Mentors
        </Button>
      </Link>

      <Card>
        <CardContent className="py-16">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Mentor Not Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              This mentor does not exist or you don&apos;t have access to view their profile.
            </p>
            <Link href="/partner/mentors">
              <Button>Return to Mentors</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
