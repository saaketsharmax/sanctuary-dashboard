'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MentorProfile } from '@/components/mentors/mentor-profile'
import { getMentorById } from '@/lib/mock-data/mentors'

interface MentorPageProps {
  params: Promise<{ id: string }>
}

export default function PartnerMentorDetailPage({ params }: MentorPageProps) {
  const { id } = use(params)
  const mentor = getMentorById(id)

  if (!mentor) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Link href="/partner/mentors">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Mentors
        </Button>
      </Link>

      <MentorProfile mentor={mentor} />
    </div>
  )
}
