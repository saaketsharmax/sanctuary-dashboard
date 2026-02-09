// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Founder Metrics Endpoint
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/founder/metrics
 * Get shared metrics for the founder's startup
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({
        success: true,
        ...getEmptyMetricsData(),
        isMock: true,
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: true,
        ...getEmptyMetricsData(),
        isMock: true,
      })
    }

    // Get user's startup_id
    const { data: profile } = await supabase
      .from('users')
      .select('startup_id')
      .eq('id', user.id)
      .single()

    if (!profile?.startup_id) {
      return NextResponse.json({
        success: true,
        ...getEmptyMetricsData(),
        isMock: true,
      })
    }

    // Get which metrics are shared with this founder
    const { data: sharedConfig } = await supabase
      .from('shared_metrics')
      .select('metric_type, show_portfolio_benchmark, show_cohort_benchmark')
      .eq('startup_id', profile.startup_id)
      .eq('is_active', true)

    // If no shared config, return limited data
    interface SharedConfig {
      metric_type: string
      show_portfolio_benchmark: boolean
      show_cohort_benchmark: boolean
    }
    const sharedTypes = (sharedConfig || []).map((s: SharedConfig) => s.metric_type)
    const showBenchmarks = sharedConfig?.some((s: SharedConfig) => s.show_portfolio_benchmark || s.show_cohort_benchmark)

    // Get latest metrics
    const { data: latestMetrics } = await supabase
      .from('metrics')
      .select('*')
      .eq('startup_id', profile.startup_id)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    // Get historical metrics (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: historicalMetrics } = await supabase
      .from('metrics')
      .select('date, mrr, active_users, churn_rate, nps_score')
      .eq('startup_id', profile.startup_id)
      .gte('date', sixMonthsAgo.toISOString())
      .order('date', { ascending: true })

    // Calculate trends
    interface MetricRecord {
      date: string
      mrr?: number
      active_users?: number
      churn_rate?: number
      nps_score?: number
    }
    const history: MetricRecord[] = historicalMetrics || []
    const current: MetricRecord = latestMetrics || {}

    // Get previous month for comparison
    const { data: previousMetrics } = await supabase
      .from('metrics')
      .select('*')
      .eq('startup_id', profile.startup_id)
      .order('date', { ascending: false })
      .limit(2)

    const prev: MetricRecord = previousMetrics?.[1] || {}

    // Build metrics response
    const metrics: Record<string, any> = {}

    if (sharedTypes.length === 0 || sharedTypes.includes('mrr')) {
      const currentMrr = current.mrr ?? 0
      const prevMrr = prev.mrr ?? 0
      const mrrChange = prevMrr ? Math.round(((currentMrr - prevMrr) / prevMrr) * 100) : 0
      metrics.mrr = {
        value: currentMrr,
        change: mrrChange,
        trend: mrrChange >= 0 ? 'up' : 'down',
        history: history.map((h: MetricRecord) => ({ date: h.date, value: h.mrr ?? 0 })),
      }
    }

    if (sharedTypes.length === 0 || sharedTypes.includes('users')) {
      const currentUsers = current.active_users ?? 0
      const prevUsers = prev.active_users ?? 0
      const usersChange = prevUsers ? Math.round(((currentUsers - prevUsers) / prevUsers) * 100) : 0
      metrics.activeUsers = {
        value: currentUsers,
        change: usersChange,
        trend: usersChange >= 0 ? 'up' : 'down',
        history: history.map((h: MetricRecord) => ({ date: h.date, value: h.active_users ?? 0 })),
      }
    }

    if (sharedTypes.length === 0 || sharedTypes.includes('retention')) {
      const currentChurn = current.churn_rate ?? 0
      const prevChurn = prev.churn_rate ?? 0
      const retention = 100 - currentChurn
      const prevRetention = 100 - prevChurn
      const retentionChange = prevChurn ? Math.round(retention - prevRetention) : 0
      metrics.retention = {
        value: retention,
        change: retentionChange,
        trend: retentionChange >= 0 ? 'up' : 'down',
        history: history.map((h: MetricRecord) => ({ date: h.date, value: h.churn_rate ? 100 - h.churn_rate : 0 })),
      }
    }

    if (sharedTypes.length === 0 || sharedTypes.includes('nps')) {
      const currentNps = current.nps_score ?? 0
      const prevNps = prev.nps_score ?? 0
      const npsChange = prevNps ? currentNps - prevNps : 0
      metrics.nps = {
        value: currentNps,
        change: npsChange,
        trend: npsChange >= 0 ? 'up' : 'down',
        history: history.map((h: MetricRecord) => ({ date: h.date, value: h.nps_score ?? 0 })),
      }
    }

    // Get benchmarks if enabled
    let benchmarks = null
    if (showBenchmarks) {
      // Calculate portfolio averages (simplified)
      const { data: portfolioMetrics } = await supabase
        .from('metrics')
        .select('mrr, active_users, churn_rate, nps_score')
        .order('date', { ascending: false })
        .limit(100)

      if (portfolioMetrics && portfolioMetrics.length > 0) {
        interface PortfolioMetric {
          mrr: number | null
          active_users: number | null
          churn_rate: number | null
          nps_score: number | null
        }
        const typedPortfolioMetrics = portfolioMetrics as PortfolioMetric[]
        benchmarks = {
          avgMrr: Math.round(typedPortfolioMetrics.reduce((sum: number, m: PortfolioMetric) => sum + (m.mrr || 0), 0) / typedPortfolioMetrics.length),
          avgUsers: Math.round(typedPortfolioMetrics.reduce((sum: number, m: PortfolioMetric) => sum + (m.active_users || 0), 0) / typedPortfolioMetrics.length),
          avgRetention: Math.round(100 - typedPortfolioMetrics.reduce((sum: number, m: PortfolioMetric) => sum + (m.churn_rate || 0), 0) / typedPortfolioMetrics.length),
          avgNps: Math.round(typedPortfolioMetrics.reduce((sum: number, m: PortfolioMetric) => sum + (m.nps_score || 0), 0) / typedPortfolioMetrics.length),
        }
      }
    }

    return NextResponse.json({
      success: true,
      metrics,
      benchmarks,
      sharedMetrics: sharedTypes,
      lastUpdated: current.date || new Date().toISOString(),
      isMock: false,
    })
  } catch (error) {
    console.error('Founder metrics API error:', error)
    return NextResponse.json({
      success: true,
      ...getEmptyMetricsData(),
      isMock: true,
    })
  }
}

function getEmptyMetricsData() {
  return {
    metrics: {},
    benchmarks: null,
    sharedMetrics: [],
    lastUpdated: null,
  }
}
