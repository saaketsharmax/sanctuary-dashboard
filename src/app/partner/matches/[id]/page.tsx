'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MatchDetail } from '@/components/mentors/match-detail'
import { getMatchById } from '@/lib/mock-data'

interface MatchPageProps {
  params: Promise<{ id: string }>
}

export default function PartnerMatchDetailPage({ params }: MatchPageProps) {
  const { id } = use(params)
  const match = getMatchById(id)

  if (!match) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Link href="/partner/matches">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Matches
        </Button>
      </Link>

      <MatchDetail match={match} />
    </div>
  )
}
