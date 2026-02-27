'use client'

import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react'

const startups = [
  {
    id: '1',
    name: 'TechFlow AI',
    logo: 'T',
    industry: 'B2B SaaS',
    stage: 'Solution Shaping',
    mrr: '$8.5K',
    mrrChange: 12,
    users: 234,
    insight: 'Strong user acquisition this month',
    bgColor: 'from-blue-500 to-purple-600'
  },
  {
    id: '2',
    name: 'GreenCommute',
    logo: 'G',
    industry: 'Climate Tech',
    stage: 'Growth',
    mrr: '$15.2K',
    mrrChange: 18,
    users: 542,
    insight: 'Revenue accelerating, on track for next milestone',
    bgColor: 'from-green-500 to-emerald-600'
  },
  {
    id: '3',
    name: 'HealthBridge',
    logo: 'H',
    industry: 'HealthTech',
    stage: 'User Value',
    mrr: '$12.8K',
    mrrChange: 5,
    users: 398,
    insight: 'Steady progress, consider expansion strategies',
    bgColor: 'from-red-500 to-pink-600'
  },
  {
    id: '4',
    name: 'BuildRight Co',
    logo: 'B',
    industry: 'PropTech',
    stage: 'Problem Discovery',
    mrr: '$3.2K',
    mrrChange: -15,
    users: 89,
    insight: 'Revenue declining, needs immediate attention',
    bgColor: 'from-orange-500 to-amber-600'
  },
]

export function PartnerPortfolioContent() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-8 py-5 bg-card border-b border-border/30">
        <h1 className="text-lg font-semibold text-foreground">Portfolio</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-6 space-y-8">
          {/* Portfolio Summary - More Conversational */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Your portfolio overview</p>
            <div className="flex items-baseline gap-6 flex-wrap">
              <div>
                <p className="text-3xl font-semibold text-foreground">24 startups</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-semibold text-foreground">$142K</p>
                <p className="text-sm text-muted-foreground">total MRR</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-semibold text-green-600">+15%</p>
                <p className="text-sm text-muted-foreground">avg growth</p>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="border-l-2 border-blue-200 pl-4 py-2">
            <p className="text-sm text-muted-foreground mb-1">This month's highlight</p>
            <p className="text-base text-foreground">
              GreenCommute is accelerating with 18% growth. BuildRight Co needs attention with -15% revenue decline.
            </p>
          </div>

          {/* Startups List - Simplified */}
          <div className="space-y-0">
            {startups.map((startup, index) => (
              <div
                key={startup.id}
                className={`py-6 hover:bg-muted/30 transition-colors cursor-pointer group ${
                  index !== startups.length - 1 ? 'border-b border-border/30' : ''
                }`}
              >
                {/* Company Header */}
                <div className="flex items-start gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${startup.bgColor} flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}>
                    {startup.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground">{startup.name}</h3>
                      <span className="text-sm text-muted-foreground">·</span>
                      <span className="text-sm text-muted-foreground">{startup.industry}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{startup.stage}</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg">
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Metrics - Simplified Inline */}
                <div className="flex items-center gap-6 mb-3 ml-16">
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-semibold text-foreground">{startup.mrr}</p>
                    <span className={`flex items-center gap-0.5 text-sm font-medium ${startup.mrrChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {startup.mrrChange > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {Math.abs(startup.mrrChange)}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-base font-medium text-foreground">{startup.users}</p>
                    <p className="text-sm text-muted-foreground">users</p>
                  </div>
                </div>

                {/* Insight */}
                <div className="ml-16">
                  <p className="text-sm text-muted-foreground italic">{startup.insight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
