'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Calendar, Mail, ArrowRight, Loader2 } from 'lucide-react'
function SuccessContent() {
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('id') || 'app-demo'

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Success Icon */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">Application Submitted!</h1>
        <p className="text-muted-foreground mt-2">
          Thank you for applying to Sanctuary.
        </p>
      </div>

      {/* Application ID */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Application ID</CardTitle>
        </CardHeader>
        <CardContent>
          <code className="text-lg font-mono bg-muted px-3 py-2 rounded block text-center">
            {applicationId}
          </code>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Save this ID for your records
          </p>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">What happens next?</CardTitle>
          <CardDescription>Here is what to expect</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div>
              <h4 className="font-medium">Check your email</h4>
              <p className="text-sm text-muted-foreground">
                We have sent a confirmation email with your application details.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div>
              <h4 className="font-medium">Interview scheduling (within 48 hours)</h4>
              <p className="text-sm text-muted-foreground">
                If your application is selected, we will send you a link to schedule your AI interview.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div>
              <h4 className="font-medium">Complete the interview</h4>
              <p className="text-sm text-muted-foreground">
                The AI interview takes about 45-60 minutes. It is a deep conversation about you and your startup.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Interview Link */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-medium">Want to try the interview now?</h4>
              <p className="text-sm text-muted-foreground">
                Experience our AI interview with a demo application.
              </p>
            </div>
            <Link href="/interview/app-1">
              <Button>
                Try Demo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Back to Home */}
      <div className="text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          Back to home
        </Link>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="max-w-xl mx-auto flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function ApplySuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  )
}
