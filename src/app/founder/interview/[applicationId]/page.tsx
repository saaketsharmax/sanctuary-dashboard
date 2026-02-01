import { auth } from '@/lib/auth/auth-config'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FounderHeader } from '@/components/founder/layout/founder-header'

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
    <div className="flex flex-col h-full bg-[var(--deep-black)]">
      <FounderHeader
        title="AI_INTERVIEW"
        breadcrumb={['Apply', 'Interview']}
        description="Complete your application with a short interview"
      />

      <div className="flex-1 flex items-center justify-center p-10">
        <div className="max-w-xl text-center">
          <div className="size-24 border border-[var(--grid-line)] mx-auto mb-8 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-[var(--olive)]">smart_toy</span>
          </div>

          <h2 className="text-3xl font-bold font-mono uppercase tracking-tight text-[var(--cream)] mb-4">
            READY_FOR_YOUR_INTERVIEW?
          </h2>
          <p className="text-[var(--cream)]/60 mb-10">
            Our AI will ask you questions about your startup to help us understand your journey better.
          </p>

          <div className="border border-[var(--grid-line)] divide-y divide-[var(--grid-line)] mb-10 text-left">
            <div className="p-4 flex items-start gap-4">
              <span className="material-symbols-outlined text-[var(--olive)]">schedule</span>
              <div>
                <p className="font-mono text-sm text-[var(--cream)]">DURATION: ~45_MINUTES</p>
                <p className="text-[10px] text-[var(--cream)]/60 font-mono uppercase mt-1">
                  Take your time to answer thoughtfully. You can pause and continue later.
                </p>
              </div>
            </div>

            <div className="p-4 flex items-start gap-4">
              <span className="material-symbols-outlined text-[var(--olive)]">checklist</span>
              <div>
                <p className="font-mono text-sm text-[var(--cream)]">5_SECTIONS</p>
                <p className="text-[10px] text-[var(--cream)]/60 font-mono uppercase mt-1">
                  Founder DNA, Problem, Solution, Market, and Sanctuary Fit
                </p>
              </div>
            </div>

            <div className="p-4 flex items-start gap-4">
              <span className="material-symbols-outlined text-[var(--olive)]">chat</span>
              <div>
                <p className="font-mono text-sm text-[var(--cream)]">CONVERSATIONAL_FORMAT</p>
                <p className="text-[10px] text-[var(--cream)]/60 font-mono uppercase mt-1">
                  Just chat naturally. There are no right or wrong answers.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-[var(--olive)]/30 bg-[var(--olive)]/5 p-4 mb-10 text-left">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[var(--olive)]">tips_and_updates</span>
              <p className="text-sm text-[var(--cream)]/80">
                <span className="text-[var(--cream)] font-bold">TIP:</span> Find a quiet place where you can focus for the full interview.
                Your responses help us match you with the right mentors and resources.
              </p>
            </div>
          </div>

          <Link
            href={`/interview/${applicationId}/start`}
            className="inline-flex items-center gap-3 bg-[var(--olive)] text-[var(--deep-black)] px-8 py-4 text-sm font-bold tracking-widest font-mono uppercase hover:bg-[var(--cream)] transition-colors"
          >
            START_INTERVIEW
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>

          <p className="text-[10px] text-[var(--cream)]/40 font-mono mt-6">
            APPLICATION_ID: {applicationId}
          </p>
        </div>
      </div>
    </div>
  )
}
