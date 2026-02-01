import { auth } from '@/lib/auth/auth-config'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FounderHeader } from '@/components/founder/layout/founder-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

interface InterviewPageProps {
  params: Promise<{ applicationId: string }>
}

export default async function FounderInterviewPage({ params }: InterviewPageProps) {
  const session = await auth()
  const { applicationId } = await params

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col">
      <FounderHeader
        title="AI Interview"
        description="Complete your application with a short interview"
      />

      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl">Ready for Your Interview?</CardTitle>
              <CardDescription>
                Our AI will ask you questions about your startup to help us understand your journey better.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Duration: ~45 minutes</p>
                    <p className="text-sm text-muted-foreground">
                      Take your time to answer thoughtfully. You can pause and continue later.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">5 Sections</p>
                    <p className="text-sm text-muted-foreground">
                      Founder DNA, Problem, Solution, Market, and Sanctuary Fit
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Conversational Format</p>
                    <p className="text-sm text-muted-foreground">
                      Just chat naturally. There are no right or wrong answers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm">
                  <strong>Tip:</strong> Find a quiet place where you can focus for the full interview.
                  Your responses help us match you with the right mentors and resources.
                </p>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link href={`/interview/${applicationId}/start`}>
                  Start Interview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Application ID: {applicationId}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
