import type { MetricSnapshot, MetricDataPoint, StartupMetrics, PortfolioMetrics } from '@/types'
import { calculateTrend, calculatePercentChange } from '@/types'
import { startups } from './startups'

// Generate date strings for the past N months
function generateDates(months: number): string[] {
  const dates: string[] = []
  const now = new Date('2026-02-01')
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setMonth(date.getMonth() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}

const dates = generateDates(6)

// Mock metric snapshots for each startup (latest values)
export const metricSnapshots: MetricSnapshot[] = [
  // TechFlow AI - Strong growth
  {
    id: 'metrics-1-latest',
    startupId: 'startup-1',
    recordedAt: '2026-02-01',
    mrr: 4500000, // $45,000
    arr: 54000000,
    totalUsers: 1250,
    activeUsers: 980,
    newUsers: 145,
    retentionRate: 94,
    churnRate: 6,
    nps: 52,
    activationRate: 78,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  // GreenCommute - Moderate growth
  {
    id: 'metrics-2-latest',
    startupId: 'startup-2',
    recordedAt: '2026-02-01',
    mrr: 1200000, // $12,000
    arr: 14400000,
    totalUsers: 320,
    activeUsers: 245,
    newUsers: 42,
    retentionRate: 88,
    churnRate: 12,
    nps: 38,
    activationRate: 65,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  // HealthBridge - Strong performer
  {
    id: 'metrics-3-latest',
    startupId: 'startup-3',
    recordedAt: '2026-02-01',
    mrr: 8200000, // $82,000
    arr: 98400000,
    totalUsers: 2800,
    activeUsers: 2450,
    newUsers: 280,
    retentionRate: 96,
    churnRate: 4,
    nps: 68,
    activationRate: 82,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  // FinLit - Early stage, lower metrics
  {
    id: 'metrics-4-latest',
    startupId: 'startup-4',
    recordedAt: '2026-02-01',
    mrr: 280000, // $2,800 (freemium model)
    arr: 3360000,
    totalUsers: 8500,
    activeUsers: 3200,
    newUsers: 1200,
    retentionRate: 45,
    churnRate: 55,
    nps: 22,
    activationRate: 38,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  // BuildRight - B2B, steady growth
  {
    id: 'metrics-5-latest',
    startupId: 'startup-5',
    recordedAt: '2026-02-01',
    mrr: 6800000, // $68,000
    arr: 81600000,
    totalUsers: 890,
    activeUsers: 780,
    newUsers: 85,
    retentionRate: 92,
    churnRate: 8,
    nps: 58,
    activationRate: 75,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
]

// Historical MRR data for each startup
export const mrrHistoryData: Record<string, MetricDataPoint[]> = {
  'startup-1': [
    { date: dates[0], value: 2500000 },
    { date: dates[1], value: 2900000 },
    { date: dates[2], value: 3300000 },
    { date: dates[3], value: 3700000 },
    { date: dates[4], value: 4100000 },
    { date: dates[5], value: 4500000 },
  ],
  'startup-2': [
    { date: dates[0], value: 600000 },
    { date: dates[1], value: 720000 },
    { date: dates[2], value: 850000 },
    { date: dates[3], value: 950000 },
    { date: dates[4], value: 1080000 },
    { date: dates[5], value: 1200000 },
  ],
  'startup-3': [
    { date: dates[0], value: 4500000 },
    { date: dates[1], value: 5200000 },
    { date: dates[2], value: 5900000 },
    { date: dates[3], value: 6600000 },
    { date: dates[4], value: 7400000 },
    { date: dates[5], value: 8200000 },
  ],
  'startup-4': [
    { date: dates[0], value: 80000 },
    { date: dates[1], value: 110000 },
    { date: dates[2], value: 150000 },
    { date: dates[3], value: 190000 },
    { date: dates[4], value: 230000 },
    { date: dates[5], value: 280000 },
  ],
  'startup-5': [
    { date: dates[0], value: 4000000 },
    { date: dates[1], value: 4500000 },
    { date: dates[2], value: 5000000 },
    { date: dates[3], value: 5600000 },
    { date: dates[4], value: 6200000 },
    { date: dates[5], value: 6800000 },
  ],
}

// Historical user data
export const userHistoryData: Record<string, MetricDataPoint[]> = {
  'startup-1': [
    { date: dates[0], value: 650 },
    { date: dates[1], value: 780 },
    { date: dates[2], value: 900 },
    { date: dates[3], value: 1020 },
    { date: dates[4], value: 1140 },
    { date: dates[5], value: 1250 },
  ],
  'startup-2': [
    { date: dates[0], value: 150 },
    { date: dates[1], value: 185 },
    { date: dates[2], value: 220 },
    { date: dates[3], value: 255 },
    { date: dates[4], value: 290 },
    { date: dates[5], value: 320 },
  ],
  'startup-3': [
    { date: dates[0], value: 1500 },
    { date: dates[1], value: 1750 },
    { date: dates[2], value: 2000 },
    { date: dates[3], value: 2250 },
    { date: dates[4], value: 2520 },
    { date: dates[5], value: 2800 },
  ],
  'startup-4': [
    { date: dates[0], value: 2000 },
    { date: dates[1], value: 3200 },
    { date: dates[2], value: 4500 },
    { date: dates[3], value: 5800 },
    { date: dates[4], value: 7100 },
    { date: dates[5], value: 8500 },
  ],
  'startup-5': [
    { date: dates[0], value: 520 },
    { date: dates[1], value: 590 },
    { date: dates[2], value: 660 },
    { date: dates[3], value: 730 },
    { date: dates[4], value: 810 },
    { date: dates[5], value: 890 },
  ],
}

// Historical retention data
export const retentionHistoryData: Record<string, MetricDataPoint[]> = {
  'startup-1': [
    { date: dates[0], value: 89 },
    { date: dates[1], value: 90 },
    { date: dates[2], value: 92 },
    { date: dates[3], value: 93 },
    { date: dates[4], value: 93 },
    { date: dates[5], value: 94 },
  ],
  'startup-2': [
    { date: dates[0], value: 82 },
    { date: dates[1], value: 84 },
    { date: dates[2], value: 85 },
    { date: dates[3], value: 86 },
    { date: dates[4], value: 87 },
    { date: dates[5], value: 88 },
  ],
  'startup-3': [
    { date: dates[0], value: 93 },
    { date: dates[1], value: 94 },
    { date: dates[2], value: 95 },
    { date: dates[3], value: 95 },
    { date: dates[4], value: 96 },
    { date: dates[5], value: 96 },
  ],
  'startup-4': [
    { date: dates[0], value: 38 },
    { date: dates[1], value: 40 },
    { date: dates[2], value: 42 },
    { date: dates[3], value: 43 },
    { date: dates[4], value: 44 },
    { date: dates[5], value: 45 },
  ],
  'startup-5': [
    { date: dates[0], value: 88 },
    { date: dates[1], value: 89 },
    { date: dates[2], value: 90 },
    { date: dates[3], value: 91 },
    { date: dates[4], value: 91 },
    { date: dates[5], value: 92 },
  ],
}

// Getter functions following existing patterns

export function getMetricSnapshotByStartupId(startupId: string): MetricSnapshot | undefined {
  return metricSnapshots.find((m) => m.startupId === startupId)
}

export function getStartupMetrics(startupId: string): StartupMetrics | undefined {
  const snapshot = getMetricSnapshotByStartupId(startupId)
  const startup = startups.find((s) => s.id === startupId)

  if (!snapshot || !startup) return undefined

  const mrrHistory = mrrHistoryData[startupId] || []
  const userHistory = userHistoryData[startupId] || []
  const retentionHistory = retentionHistoryData[startupId] || []

  const previousMrr = mrrHistory.length >= 2 ? mrrHistory[mrrHistory.length - 2].value : snapshot.mrr
  const previousUsers = userHistory.length >= 2 ? userHistory[userHistory.length - 2].value : snapshot.totalUsers
  const previousRetention =
    retentionHistory.length >= 2 ? retentionHistory[retentionHistory.length - 2].value : snapshot.retentionRate

  return {
    startupId,
    startupName: startup.name,
    current: snapshot,
    mrrHistory,
    userHistory,
    retentionHistory,
    mrrTrend: calculateTrend(mrrHistory),
    userTrend: calculateTrend(userHistory),
    retentionTrend: calculateTrend(retentionHistory),
    mrrChange: calculatePercentChange(snapshot.mrr, previousMrr),
    userChange: calculatePercentChange(snapshot.totalUsers, previousUsers),
    retentionChange: snapshot.retentionRate - previousRetention,
  }
}

export function getAllStartupMetrics(): StartupMetrics[] {
  return startups.map((s) => getStartupMetrics(s.id)).filter((m): m is StartupMetrics => m !== undefined)
}

export function getPortfolioMetrics(): PortfolioMetrics {
  const allMetrics = getAllStartupMetrics()

  const totalMRR = allMetrics.reduce((sum, m) => sum + m.current.mrr, 0)
  const totalUsers = allMetrics.reduce((sum, m) => sum + m.current.totalUsers, 0)
  const avgRetention = allMetrics.reduce((sum, m) => sum + m.current.retentionRate, 0) / allMetrics.length
  const npsScores = allMetrics.filter((m) => m.current.nps !== null).map((m) => m.current.nps!)
  const avgNPS = npsScores.length > 0 ? npsScores.reduce((a, b) => a + b, 0) / npsScores.length : null

  // Top performers by MRR growth
  const topPerformers = allMetrics
    .sort((a, b) => b.mrrChange - a.mrrChange)
    .slice(0, 3)
    .map((m) => ({
      startupId: m.startupId,
      startupName: m.startupName,
      mrrChange: m.mrrChange,
    }))

  // At risk (low retention or declining MRR)
  const atRisk = allMetrics
    .filter((m) => m.current.retentionRate < 60 || m.mrrChange < -5)
    .map((m) => ({
      startupId: m.startupId,
      startupName: m.startupName,
      issue: m.current.retentionRate < 60 ? 'Low retention' : 'Declining MRR',
    }))

  // Aggregate historical data
  const mrrHistory: MetricDataPoint[] = dates.map((date) => ({
    date,
    value: allMetrics.reduce((sum, m) => {
      const point = m.mrrHistory.find((p) => p.date === date)
      return sum + (point?.value || 0)
    }, 0),
  }))

  const userHistory: MetricDataPoint[] = dates.map((date) => ({
    date,
    value: allMetrics.reduce((sum, m) => {
      const point = m.userHistory.find((p) => p.date === date)
      return sum + (point?.value || 0)
    }, 0),
  }))

  return {
    totalMRR,
    totalARR: totalMRR * 12,
    totalUsers,
    averageRetention: Math.round(avgRetention),
    averageNPS: avgNPS !== null ? Math.round(avgNPS) : null,
    topPerformers,
    atRisk,
    mrrHistory,
    userHistory,
  }
}
