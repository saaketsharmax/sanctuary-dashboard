import { auth } from '@/lib/auth/auth-config'
import { redirect } from 'next/navigation'
import { FounderHeader } from '@/components/founder/layout/founder-header'
import { getStartupMetrics } from '@/lib/mock-data'
import { formatCurrency } from '@/types'

// Mock shared metrics from partners
const mockSharedMetrics = [
  {
    id: 'shared-1',
    title: 'MRR Growth Rate',
    value: '23%',
    description: 'Month-over-month revenue growth',
    sharedBy: 'Alex Thompson',
    sharedAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 'shared-2',
    title: 'Cohort Benchmark',
    value: 'Top 20%',
    description: 'Your position among cohort startups in user growth',
    sharedBy: 'Alex Thompson',
    sharedAt: '2026-01-15T14:30:00Z',
  },
]

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'up':
      return { icon: 'trending_up', color: 'text-[var(--olive)]' }
    case 'down':
      return { icon: 'trending_down', color: 'text-[var(--warning)]' }
    default:
      return { icon: 'trending_flat', color: 'text-[var(--cream)]/40' }
  }
}

export default async function FounderMetricsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const startupId = session.user.startupId

  if (!startupId) {
    redirect('/founder/dashboard')
  }

  const metrics = getStartupMetrics(startupId)

  return (
    <div className="flex flex-col h-full bg-[var(--deep-black)]">
      <FounderHeader
        title="METRICS_OBSERVATORY"
        breadcrumb={['Metrics']}
        description="Shared metrics and partner insights"
      />

      {/* Your Metrics Overview */}
      {metrics && (
        <section className="border-b border-[var(--grid-line)]">
          <div className="px-10 py-6 border-b border-[var(--grid-line)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl text-blue-500">monitoring</span>
              <h2 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)]">
                YOUR_CURRENT_METRICS
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4">
            <div className="p-8 border-r border-[var(--grid-line)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--olive)]">MRR</p>
                <span className={`material-symbols-outlined text-lg ${getTrendIcon(metrics.mrrTrend).color}`}>
                  {getTrendIcon(metrics.mrrTrend).icon}
                </span>
              </div>
              <p className="text-4xl font-black font-mono text-[var(--cream)]">
                {formatCurrency(metrics.current.mrr)}
              </p>
              <p className="text-[10px] mt-2 text-[var(--cream)]/40 font-mono uppercase">
                {metrics.mrrChange > 0 ? '+' : ''}{metrics.mrrChange}% THIS_MONTH
              </p>
            </div>

            <div className="p-8 border-r border-[var(--grid-line)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--olive)]">ACTIVE_USERS</p>
                <span className={`material-symbols-outlined text-lg ${getTrendIcon(metrics.userTrend).color}`}>
                  {getTrendIcon(metrics.userTrend).icon}
                </span>
              </div>
              <p className="text-4xl font-black font-mono text-[var(--cream)]">
                {metrics.current.activeUsers.toLocaleString()}
              </p>
              <p className="text-[10px] mt-2 text-[var(--cream)]/40 font-mono uppercase">
                {metrics.userChange > 0 ? '+' : ''}{metrics.userChange}% THIS_MONTH
              </p>
            </div>

            <div className="p-8 border-r border-[var(--grid-line)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--olive)]">RETENTION_RATE</p>
                <span className={`material-symbols-outlined text-lg ${getTrendIcon(metrics.retentionTrend).color}`}>
                  {getTrendIcon(metrics.retentionTrend).icon}
                </span>
              </div>
              <p className="text-4xl font-black font-mono text-[var(--cream)]">
                {metrics.current.retentionRate}%
              </p>
              <p className="text-[10px] mt-2 text-[var(--cream)]/40 font-mono uppercase">
                {metrics.retentionChange > 0 ? '+' : ''}{metrics.retentionChange}% CHANGE
              </p>
            </div>

            <div className="p-8">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--olive)] mb-3">TOTAL_USERS</p>
              <p className="text-4xl font-black font-mono text-[var(--cream)]">
                {metrics.current.totalUsers.toLocaleString()}
              </p>
              <p className="text-[10px] mt-2 text-[var(--cream)]/40 font-mono uppercase">
                {metrics.current.newUsers} NEW_THIS_MONTH
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Partner Insights */}
      <section className="flex-1 overflow-auto">
        <div className="px-10 py-6 border-b border-[var(--grid-line)]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-xl text-[var(--olive)]">visibility</span>
            <h2 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)]">
              PARTNER_INSIGHTS
            </h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-[var(--cream)]/20 text-[var(--cream)]/40">
              READ_ONLY
            </span>
          </div>
          <p className="text-[10px] font-mono uppercase text-[var(--cream)]/60 mt-2">
            Metrics and analysis shared with you by Sanctuary partners
          </p>
        </div>

        {mockSharedMetrics.length > 0 ? (
          <div className="p-10 grid md:grid-cols-2 gap-px bg-[var(--grid-line)]">
            {mockSharedMetrics.map((metric) => (
              <div key={metric.id} className="bg-[var(--deep-black)] p-6 border-l-2 border-[var(--olive)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold font-mono uppercase text-[var(--cream)]">{metric.title}</p>
                    <p className="text-4xl font-black font-mono text-[var(--olive)] mt-3">{metric.value}</p>
                    <p className="text-sm text-[var(--cream)]/60 mt-2">{metric.description}</p>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-[var(--olive)] text-[var(--olive)] flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">visibility</span>
                    SHARED
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--grid-line)]">
                  <p className="text-[10px] font-mono text-[var(--cream)]/40">
                    SHARED BY {metric.sharedBy.toUpperCase()} ON {new Date(metric.sharedAt).toLocaleDateString().toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="material-symbols-outlined text-5xl text-[var(--cream)]/20 mb-4">lock</span>
            <p className="text-[var(--cream)]/40 font-mono uppercase text-sm">NO_SHARED_METRICS_YET</p>
            <p className="text-[10px] text-[var(--cream)]/20 font-mono uppercase mt-2">
              Partners will share insights with you as they become available
            </p>
          </div>
        )}
      </section>

      {/* Info Card */}
      <section className="border-t border-[var(--grid-line)] p-6">
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined text-xl text-[var(--olive)]">info</span>
          <div className="text-[10px] font-mono text-[var(--cream)]/60 space-y-1">
            <p><span className="text-[var(--cream)]">PARTNER_INSIGHTS:</span> SANCTUARY PARTNERS MAY SHARE SPECIFIC METRICS, BENCHMARKS, OR ANALYSIS TO HELP TRACK YOUR PROGRESS</p>
            <p><span className="text-[var(--cream)]">PRIVACY:</span> YOU CONTROL WHAT DATA IS SHARED WITH PARTNERS. VISIT SETTINGS TO MANAGE DATA SHARING PREFERENCES</p>
            <p><span className="text-[var(--cream)]">UPDATES:</span> SHARED METRICS ARE READ-ONLY AND UPDATED BY PARTNERS AS NEW DATA BECOMES AVAILABLE</p>
          </div>
        </div>
      </section>
    </div>
  )
}
