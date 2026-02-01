'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { InterviewChat } from '@/components/onboarding/interview'
import { useInterviewStore } from '@/lib/stores/interview-store'
import { getApplicationById } from '@/lib/mock-data/onboarding'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function InterviewChatPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.applicationId as string
  const { currentInterview } = useInterviewStore()

  // Get application data
  const application = getApplicationById(applicationId)

  // Handle interview completion
  const handleComplete = () => {
    router.push(`/interview/${applicationId}/complete`)
  }

  // Redirect if interview is already completed
  useEffect(() => {
    if (currentInterview?.status === 'completed') {
      router.push(`/interview/${applicationId}/complete`)
    }
  }, [currentInterview?.status, applicationId, router])

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Application Not Found</h1>
        <p className="text-muted-foreground mb-4">
          We couldn&apos;t find an application with this ID.
        </p>
        <Button onClick={() => router.push('/apply')}>Submit New Application</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Compact Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{application.companyName} Interview</h1>
          <p className="text-sm text-muted-foreground">
            Answer honestly and take your time
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <InterviewChat applicationId={applicationId} onComplete={handleComplete} />
    </div>
  )
}
