'use client'

import { Button } from '@/components/ui/button'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { InterviewChat } from '@/components/onboarding/interview'
import { useInterviewStore } from '@/lib/stores/interview-store'
import { AlertCircle, Loader2 } from 'lucide-react'
interface Application {
  id: string
  companyName: string
}

export default function InterviewChatPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.applicationId as string
  const { currentInterview } = useInterviewStore()

  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch application data
  useEffect(() => {
    async function fetchApplication() {
      try {
        const response = await fetch(`/api/applications/${applicationId}`)
        if (!response.ok) {
          throw new Error('Application not found')
        }
        const data = await response.json()
        if (data.success && data.application) {
          setApplication(data.application)
        } else {
          throw new Error('Application not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load application')
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [applicationId])

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading application...</p>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
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
