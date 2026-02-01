import { auth } from '@/lib/auth/auth-config'
import { redirect } from 'next/navigation'
import { FounderHeader } from '@/components/founder/layout/founder-header'
import Link from 'next/link'
import { getStartupById, getCheckpointsByStartupId, getStartupMetrics } from '@/lib/mock-data'

export default async function FounderDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Get founder's startup data
  const startupId = session.user.startupId
  const startup = startupId ? getStartupById(startupId) : null
  const checkpoints = startupId ? getCheckpointsByStartupId(startupId) : []
  const metrics = startupId ? getStartupMetrics(startupId) : null

  // If founder hasn't completed onboarding (no startup), show onboarding prompt
  if (!startup) {
    return (
      <div className="flex flex-col h-full bg-[var(--deep-black)]">
        <FounderHeader
          title="INITIALIZATION_REQUIRED"
          breadcrumb={['Onboarding']}
        />
        <div className="flex-1 flex items-center justify-center p-10">
          <div className="max-w-xl text-center">
            <div className="size-24 border border-[var(--grid-line)] mx-auto mb-8 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-[var(--olive)]">rocket_launch</span>
            </div>
            <h2 className="text-4xl font-bold font-mono uppercase tracking-tight text-[var(--cream)] mb-4">
              START_YOUR_APPLICATION
            </h2>
            <p className="text-[var(--cream)]/60 mb-8">
              Complete your application to join the Sanctuary accelerator programme
            </p>

            <div className="space-y-4 mb-10 text-left max-w-sm mx-auto">
              <div className="flex items-center gap-4 p-4 border border-[var(--grid-line)]">
                <span className="material-symbols-outlined text-[var(--olive)]">check_circle</span>
                <span className="text-sm text-[var(--cream)]/80 font-mono uppercase">Tell us about your startup</span>
              </div>
              <div className="flex items-center gap-4 p-4 border border-[var(--grid-line)]">
                <span className="material-symbols-outlined text-[var(--olive)]">check_circle</span>
                <span className="text-sm text-[var(--cream)]/80 font-mono uppercase">Complete AI-powered interview</span>
              </div>
              <div className="flex items-center gap-4 p-4 border border-[var(--grid-line)]">
                <span className="material-symbols-outlined text-[var(--olive)]">check_circle</span>
                <span className="text-sm text-[var(--cream)]/80 font-mono uppercase">Get matched with mentors</span>
              </div>
            </div>

            <Link
              href="/founder/apply"
              className="inline-flex items-center gap-3 bg-[var(--olive)] text-[var(--deep-black)] px-8 py-4 text-sm font-bold tracking-widest font-mono uppercase hover:bg-[var(--cream)] transition-colors"
            >
              INITIALIZE_APPLICATION
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const completedCheckpoints = checkpoints.filter((c) => c.status === 'completed').length
  const totalCheckpoints = checkpoints.length
  const activeCheckpoint = checkpoints.find((c) => c.status === 'in_progress')

  return (
    <div className="flex flex-col h-full bg-[var(--deep-black)]">
      <FounderHeader
        title="COMMAND_CENTER"
        breadcrumb={['Dashboard']}
        description={startup.name}
      />

      {/* Company Overview */}
      <section className="border-b border-[var(--grid-line)] p-10">
        <div className="flex items-center gap-6">
          {startup.logoUrl ? (
            <div
              className="size-20 border border-[var(--grid-line)] bg-cover bg-center"
              style={{ backgroundImage: `url("${startup.logoUrl}")` }}
            />
          ) : (
            <div className="size-20 border border-[var(--grid-line)] flex items-center justify-center">
              <span className="text-3xl font-bold font-mono text-[var(--olive)]">
                {startup.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold font-mono uppercase tracking-tight text-[var(--cream)]">
              {startup.name.replace(/ /g, '_').toUpperCase()}
            </h2>
            <p className="text-sm text-[var(--cream)]/60 mt-1">{startup.oneLiner}</p>
          </div>
          <span className="text-[10px] font-mono uppercase px-3 py-1 border border-[var(--olive)] text-[var(--olive)]">
            {startup.stage.replace('_', '_').toUpperCase()}_STAGE
          </span>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 border-b border-[var(--grid-line)]">
        <div className="p-8 border-r border-[var(--grid-line)]">
          <p className="text-[var(--olive)] text-[10px] font-bold tracking-[0.2em] mb-3 font-mono uppercase">
            MONTHLY_REVENUE
          </p>
          <p className="text-4xl font-black font-mono text-[var(--cream)]">
            ${metrics ? (metrics.current.mrr / 100).toLocaleString() : '0'}
          </p>
          {metrics && (
            <p className="text-[10px] mt-2 text-[var(--cream)]/40 font-mono uppercase flex items-center gap-1">
              <span className={`material-symbols-outlined text-sm ${metrics.mrrTrend === 'up' ? 'text-[var(--olive)]' : metrics.mrrTrend === 'down' ? 'text-[var(--warning)]' : ''}`}>
                {metrics.mrrTrend === 'up' ? 'trending_up' : metrics.mrrTrend === 'down' ? 'trending_down' : 'trending_flat'}
              </span>
              {Math.abs(metrics.mrrChange)}% FROM_LAST_MONTH
            </p>
          )}
        </div>
        <div className="p-8 border-r border-[var(--grid-line)]">
          <p className="text-[var(--olive)] text-[10px] font-bold tracking-[0.2em] mb-3 font-mono uppercase">
            ACTIVE_USERS
          </p>
          <p className="text-4xl font-black font-mono text-[var(--cream)]">
            {metrics?.current.activeUsers.toLocaleString() || '0'}
          </p>
          {metrics && (
            <p className="text-[10px] mt-2 text-[var(--cream)]/40 font-mono uppercase flex items-center gap-1">
              <span className={`material-symbols-outlined text-sm ${metrics.userTrend === 'up' ? 'text-[var(--olive)]' : metrics.userTrend === 'down' ? 'text-[var(--warning)]' : ''}`}>
                {metrics.userTrend === 'up' ? 'trending_up' : metrics.userTrend === 'down' ? 'trending_down' : 'trending_flat'}
              </span>
              {Math.abs(metrics.userChange)}% FROM_LAST_MONTH
            </p>
          )}
        </div>
        <div className="p-8 border-r border-[var(--grid-line)]">
          <p className="text-[var(--olive)] text-[10px] font-bold tracking-[0.2em] mb-3 font-mono uppercase">
            PROGRESS
          </p>
          <p className="text-4xl font-black font-mono text-[var(--cream)]">
            {completedCheckpoints}/{totalCheckpoints}
          </p>
          <p className="text-[10px] mt-2 text-[var(--cream)]/40 font-mono uppercase">
            CHECKPOINTS_COMPLETED
          </p>
        </div>
        <div className="p-8">
          <p className="text-[var(--olive)] text-[10px] font-bold tracking-[0.2em] mb-3 font-mono uppercase">
            SANCTUARY_SCORE
          </p>
          <p className="text-4xl font-black font-mono text-[var(--cream)]">
            {startup.overallScore || '--'}
          </p>
          <p className="text-[10px] mt-2 text-[var(--cream)]/40 font-mono uppercase">
            OUT_OF_100
          </p>
        </div>
      </section>

      <div className="flex-1 overflow-auto">
        {/* Active Checkpoint */}
        {activeCheckpoint && (
          <section className="border-b border-[var(--grid-line)] p-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[var(--olive)] text-[var(--deep-black)]">
                    WEEK_{activeCheckpoint.weekNumber}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-blue-500 text-blue-500">
                    IN_PROGRESS
                  </span>
                </div>
                <h3 className="text-xl font-bold font-mono uppercase tracking-tight text-[var(--cream)]">
                  {activeCheckpoint.goal || 'Current Checkpoint'}
                </h3>
                {activeCheckpoint.checkpointQuestion && (
                  <p className="text-sm text-[var(--cream)]/60 mt-2 max-w-2xl">
                    {activeCheckpoint.checkpointQuestion}
                  </p>
                )}
              </div>
              <Link
                href="/founder/progress"
                className="text-[10px] font-mono uppercase tracking-widest px-4 py-2 border border-[var(--cream)]/20 text-[var(--cream)]/60 hover:border-[var(--olive)] hover:text-[var(--olive)] transition-colors flex items-center gap-2"
              >
                VIEW_DETAILS
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="grid md:grid-cols-3 border-b border-[var(--grid-line)]">
          <Link
            href="/founder/company"
            className="p-8 border-r border-[var(--grid-line)] hover:bg-[#0a0a0a] transition-colors group"
          >
            <span className="material-symbols-outlined text-3xl text-[var(--olive)] mb-4">apartment</span>
            <h3 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)] group-hover:text-[var(--olive)] transition-colors">
              COMPANY_PROFILE
            </h3>
            <p className="text-[10px] text-[var(--cream)]/40 font-mono uppercase mt-2">
              Update your startup information
            </p>
          </Link>
          <Link
            href="/founder/documents"
            className="p-8 border-r border-[var(--grid-line)] hover:bg-[#0a0a0a] transition-colors group"
          >
            <span className="material-symbols-outlined text-3xl text-[var(--olive)] mb-4">description</span>
            <h3 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)] group-hover:text-[var(--olive)] transition-colors">
              DOCUMENTS
            </h3>
            <p className="text-[10px] text-[var(--cream)]/40 font-mono uppercase mt-2">
              Upload pitch decks and files
            </p>
          </Link>
          <Link
            href="/founder/requests"
            className="p-8 hover:bg-[#0a0a0a] transition-colors group"
          >
            <span className="material-symbols-outlined text-3xl text-[var(--olive)] mb-4">support_agent</span>
            <h3 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)] group-hover:text-[var(--olive)] transition-colors">
              GET_HELP
            </h3>
            <p className="text-[10px] text-[var(--cream)]/40 font-mono uppercase mt-2">
              Request mentor or feature support
            </p>
          </Link>
        </section>
      </div>
    </div>
  )
}
