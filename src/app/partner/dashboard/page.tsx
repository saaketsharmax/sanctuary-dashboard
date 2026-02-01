import { auth } from '@/lib/auth/auth-config'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PartnerHeader } from '@/components/partner/layout/partner-header'
import {
  getPortfolioStats,
  getPortfolioMetrics,
  getAllApplicationsWithFounders,
  getPendingMatchesWithDetails,
  getAllStartupsWithFounders,
} from '@/lib/mock-data'
import { formatCurrency } from '@/types'

export default async function PartnerDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const stats = getPortfolioStats()
  const portfolioMetrics = getPortfolioMetrics()
  const applications = getAllApplicationsWithFounders()
  const pendingMatches = getPendingMatchesWithDetails()
  const startups = getAllStartupsWithFounders()

  // Get applications needing review
  const pendingApplications = applications.filter(
    (app) => app.status === 'submitted' || app.status === 'interview_completed' || app.status === 'assessment_generated'
  )

  // Get at-risk startups
  const atRiskStartups = startups.filter((s) => s.riskLevel === 'elevated' || s.riskLevel === 'high')

  return (
    <div className="flex flex-col h-full">
      <PartnerHeader
        title="COMMAND_CENTER"
        breadcrumb={['Dashboard']}
      />

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 border-b border-[var(--grid-line)]">
        <div className="p-8 border-r border-[var(--grid-line)]">
          <p className="text-[var(--olive)] text-[10px] font-bold tracking-[0.2em] mb-3 font-mono uppercase">
            ACTIVE_ENTITIES
          </p>
          <p className="text-4xl font-black font-mono text-[var(--cream)]">
            {stats.totalStartups.toString().padStart(2, '0')}
          </p>
          <p className="text-[10px] mt-2 text-[var(--cream)]/40 font-mono uppercase">
            {stats.activeStartups} OPERATIONAL
          </p>
        </div>
        <div className="p-8 border-r border-[var(--grid-line)]">
          <p className="text-[var(--olive)] text-[10px] font-bold tracking-[0.2em] mb-3 font-mono uppercase">
            PORTFOLIO_MRR
          </p>
          <p className="text-4xl font-black font-mono text-[var(--cream)]">
            {formatCurrency(portfolioMetrics.totalMRR)}
          </p>
          <p className="text-[10px] mt-2 text-[var(--cream)]/40 font-mono uppercase">
            AGGREGATE_REVENUE
          </p>
        </div>
        <div className="p-8 border-r border-[var(--grid-line)]">
          <p className="text-[var(--olive)] text-[10px] font-bold tracking-[0.2em] mb-3 font-mono uppercase">
            PENDING_QUEUE
          </p>
          <p className="text-4xl font-black font-mono text-[var(--cream)]">
            {pendingApplications.length.toString().padStart(2, '0')}
          </p>
          <p className="text-[10px] mt-2 text-[var(--cream)]/40 font-mono uppercase">
            APPLICATIONS_WAITING
          </p>
        </div>
        <div className="p-8">
          <p className="text-[var(--warning)] text-[10px] font-bold tracking-[0.2em] mb-3 font-mono uppercase">
            RISK_ALERT
          </p>
          <p className="text-4xl font-black font-mono text-[var(--warning)]">
            {atRiskStartups.length.toString().padStart(2, '0')}
          </p>
          <p className="text-[10px] mt-2 text-[var(--cream)]/40 font-mono uppercase">
            ENTITIES_FLAGGED
          </p>
        </div>
      </section>

      <div className="flex-1 overflow-auto">
        <div className="grid lg:grid-cols-2">
          {/* Pending Applications */}
          <div className="border-r border-b lg:border-b-0 border-[var(--grid-line)]">
            <div className="px-8 py-4 border-b border-[var(--grid-line)] flex items-center justify-between">
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--cream)]">
                APPLICATION_QUEUE
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-1 bg-[var(--olive)] text-[var(--deep-black)]">
                {pendingApplications.length}
              </span>
            </div>
            <div className="p-4 space-y-px bg-[var(--grid-line)]">
              {pendingApplications.length > 0 ? (
                <>
                  {pendingApplications.slice(0, 4).map((app) => (
                    <Link
                      key={app.id}
                      href={`/partner/applications`}
                      className="block bg-[var(--deep-black)] p-4 hover:bg-[#0a0a0a] transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="size-10 border border-[var(--grid-line)] flex items-center justify-center">
                            <span className="text-[var(--olive)] font-bold font-mono">
                              {app.companyName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold font-mono uppercase tracking-tight text-[var(--cream)]">
                              {app.companyName.replace(/ /g, '_').toUpperCase()}
                            </p>
                            <p className="text-[10px] text-[var(--cream)]/40 font-mono uppercase">
                              {app.founders.length} FOUNDER{app.founders.length > 1 ? 'S' : ''}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                          app.status === 'assessment_generated'
                            ? 'border-[var(--olive)] text-[var(--olive)]'
                            : app.status === 'interview_completed'
                            ? 'border-blue-500 text-blue-500'
                            : 'border-[var(--cream)]/20 text-[var(--cream)]/60'
                        }`}>
                          {app.status.replace(/_/g, '_')}
                        </span>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href="/partner/applications"
                    className="block bg-[var(--deep-black)] p-4 text-center border border-[var(--grid-line)] hover:bg-[var(--olive)] hover:text-[var(--deep-black)] hover:border-[var(--olive)] transition-colors group"
                  >
                    <span className="text-[10px] font-bold font-mono uppercase tracking-widest">
                      VIEW_ALL_APPLICATIONS
                      <span className="material-symbols-outlined text-sm ml-2 opacity-60 group-hover:opacity-100">arrow_forward</span>
                    </span>
                  </Link>
                </>
              ) : (
                <div className="bg-[var(--deep-black)] p-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-[var(--olive)] mb-4">check_circle</span>
                  <p className="text-[var(--cream)]/60 font-mono uppercase text-sm">QUEUE_EMPTY</p>
                  <p className="text-[10px] text-[var(--cream)]/30 font-mono uppercase mt-1">No pending applications</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Matches */}
          <div className="border-b lg:border-b-0 border-[var(--grid-line)]">
            <div className="px-8 py-4 border-b border-[var(--grid-line)] flex items-center justify-between">
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--cream)]">
                MENTOR_MATCHES
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-1 bg-[var(--olive)] text-[var(--deep-black)]">
                {pendingMatches.length}
              </span>
            </div>
            <div className="p-4 space-y-px bg-[var(--grid-line)]">
              {pendingMatches.length > 0 ? (
                <>
                  {pendingMatches.slice(0, 4).map((match) => (
                    <Link
                      key={match.id}
                      href={`/partner/matches/${match.id}`}
                      className="block bg-[var(--deep-black)] p-4 hover:bg-[#0a0a0a] transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="score-block size-10 flex items-center justify-center font-black font-mono">
                            {match.score}
                          </div>
                          <div>
                            <p className="font-bold font-mono uppercase tracking-tight text-[var(--cream)]">
                              {match.mentor.name.replace(/ /g, '_').toUpperCase()}
                            </p>
                            <p className="text-[10px] text-[var(--cream)]/40 font-mono uppercase">
                              → {match.startup.name.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-[var(--olive)] text-[var(--olive)]">
                          {match.confidence}
                        </span>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href="/partner/matches"
                    className="block bg-[var(--deep-black)] p-4 text-center border border-[var(--grid-line)] hover:bg-[var(--olive)] hover:text-[var(--deep-black)] hover:border-[var(--olive)] transition-colors group"
                  >
                    <span className="text-[10px] font-bold font-mono uppercase tracking-widest">
                      VIEW_ALL_MATCHES
                      <span className="material-symbols-outlined text-sm ml-2 opacity-60 group-hover:opacity-100">arrow_forward</span>
                    </span>
                  </Link>
                </>
              ) : (
                <div className="bg-[var(--deep-black)] p-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-[var(--cream)]/40 mb-4">handshake</span>
                  <p className="text-[var(--cream)]/60 font-mono uppercase text-sm">NO_PENDING_MATCHES</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* At Risk Section */}
        {atRiskStartups.length > 0 && (
          <div className="border-t border-[var(--grid-line)]">
            <div className="px-8 py-4 border-b border-[var(--grid-line)] bg-[var(--warning)]/5 flex items-center gap-3">
              <span className="material-symbols-outlined text-[var(--warning)]">warning</span>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--warning)]">
                RISK_MONITOR
              </h2>
              <span className="text-[10px] text-[var(--cream)]/40 font-mono uppercase ml-auto">
                {atRiskStartups.length} ENTITIES FLAGGED
              </span>
            </div>
            <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--grid-line)]">
              {atRiskStartups.slice(0, 6).map((startup) => (
                <Link
                  key={startup.id}
                  href={`/partner/portfolio/${startup.id}`}
                  className="bg-[var(--deep-black)] p-4 hover:bg-[#0a0a0a] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 border border-[var(--grid-line)] flex items-center justify-center">
                      <span className="font-bold font-mono text-[var(--cream)]/60">
                        {startup.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold font-mono uppercase text-sm tracking-tight text-[var(--cream)] truncate">
                        {startup.name.replace(/ /g, '_').toUpperCase()}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex-1 h-1 bg-[var(--grid-line)]">
                          <div
                            className={`h-1 ${startup.riskLevel === 'high' ? 'bg-[var(--warning)]' : 'bg-amber-500'}`}
                            style={{ width: `${startup.overallScore || 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-[var(--cream)]/40">
                          {startup.overallScore || 0}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                      startup.riskLevel === 'high'
                        ? 'border-[var(--warning)] text-[var(--warning)]'
                        : 'border-amber-500 text-amber-500'
                    }`}>
                      {startup.riskLevel.toUpperCase()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 border-t border-[var(--grid-line)]">
          <Link
            href="/partner/portfolio"
            className="p-8 border-r border-[var(--grid-line)] hover:bg-[#0a0a0a] transition-colors group"
          >
            <span className="material-symbols-outlined text-3xl text-[var(--olive)] mb-4">layers</span>
            <h3 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)] group-hover:text-[var(--olive)] transition-colors">
              VIEW_PORTFOLIO
            </h3>
            <p className="text-[10px] text-[var(--cream)]/40 font-mono uppercase mt-2">
              Manage all startup entities
            </p>
          </Link>
          <Link
            href="/partner/metrics"
            className="p-8 border-r border-[var(--grid-line)] hover:bg-[#0a0a0a] transition-colors group"
          >
            <span className="material-symbols-outlined text-3xl text-[var(--olive)] mb-4">analytics</span>
            <h3 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)] group-hover:text-[var(--olive)] transition-colors">
              PORTFOLIO_METRICS
            </h3>
            <p className="text-[10px] text-[var(--cream)]/40 font-mono uppercase mt-2">
              Aggregate analytics view
            </p>
          </Link>
          <Link
            href="/partner/mentors"
            className="p-8 hover:bg-[#0a0a0a] transition-colors group"
          >
            <span className="material-symbols-outlined text-3xl text-[var(--olive)] mb-4">group</span>
            <h3 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)] group-hover:text-[var(--olive)] transition-colors">
              MENTOR_NETWORK
            </h3>
            <p className="text-[10px] text-[var(--cream)]/40 font-mono uppercase mt-2">
              Connect founders with mentors
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
