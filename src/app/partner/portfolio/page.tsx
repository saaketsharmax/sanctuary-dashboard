'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PartnerHeader } from '@/components/partner/layout/partner-header'
import { AddStartupModal } from '@/components/portfolio/add-startup-modal'
import { toast } from 'sonner'
import { getAllStartupsWithFounders, getPortfolioStats } from '@/lib/mock-data'
import { STAGES, RISK_LEVELS } from '@/types'
import type { Stage, RiskLevel } from '@/types'

export default function PartnerPortfolioPage() {
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>('all')
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all')
  const [addModalOpen, setAddModalOpen] = useState(false)

  const startups = getAllStartupsWithFounders()
  const stats = getPortfolioStats()

  const filteredStartups = useMemo(() => {
    return startups.filter((startup) => {
      if (stageFilter !== 'all' && startup.stage !== stageFilter) return false
      if (riskFilter !== 'all' && startup.riskLevel !== riskFilter) return false
      return true
    })
  }, [startups, stageFilter, riskFilter])

  const hasFilters = stageFilter !== 'all' || riskFilter !== 'all'

  const handleAddSuccess = (data: { name: string }) => {
    toast.success(`${data.name} added to portfolio`, {
      description: 'Entity initialized successfully.',
    })
  }

  const getStatusColor = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-[var(--olive)]'
      case 'normal':
        return 'bg-[var(--olive)]'
      case 'elevated':
        return 'bg-amber-600'
      case 'high':
        return 'bg-[var(--warning)]'
      default:
        return 'bg-[var(--cream)]/40'
    }
  }

  const getStatusText = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case 'low':
        return 'STATUS_STABLE'
      case 'normal':
        return 'STATUS_NORMAL'
      case 'elevated':
        return 'AT_RISK_WARN'
      case 'high':
        return 'CRIT_BLOCKED'
      default:
        return 'STATUS_UNKNOWN'
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PartnerHeader
        title="SANCTUARY_MGMT_V.4.2"
        breadcrumb={['Portfolio']}
        action={{
          label: 'Add New Entity',
          onClick: () => setAddModalOpen(true),
        }}
      />

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-b border-[var(--grid-line)]">
        <div className="p-10 border-r border-[var(--grid-line)] relative">
          <div className="text-[8rem] leading-[0.8] font-black tracking-tighter opacity-10 absolute pointer-events-none font-mono text-[var(--cream)]">
            {stats.totalStartups.toString().padStart(2, '0')}
          </div>
          <div className="relative z-10">
            <p className="text-[var(--olive)] text-xs font-bold tracking-[0.2em] mb-4 font-mono uppercase">
              ACTIVE_ENTITIES
            </p>
            <p className="text-4xl font-extrabold font-mono text-[var(--cream)]">
              {stats.totalStartups}
              <span className="text-sm opacity-40 ml-2">/60</span>
            </p>
            <p className="text-[10px] mt-2 opacity-50 font-light font-mono uppercase">
              SYSTEM LOAD: OPTIMAL
            </p>
          </div>
        </div>
        <div className="p-10 border-r border-[var(--grid-line)] relative">
          <div className="text-[8rem] leading-[0.8] font-black tracking-tighter opacity-10 absolute pointer-events-none font-mono text-[var(--cream)]">
            03
          </div>
          <div className="relative z-10">
            <p className="text-[var(--olive)] text-xs font-bold tracking-[0.2em] mb-4 font-mono uppercase">
              COHORT_CYCLES
            </p>
            <p className="text-4xl font-extrabold font-mono text-[var(--cream)]">SUMMER_24</p>
            <p className="text-[10px] mt-2 opacity-50 font-light font-mono uppercase">
              PHASE: EXECUTION
            </p>
          </div>
        </div>
        <div className="p-10 relative">
          <div className="text-[8rem] leading-[0.8] font-black tracking-tighter opacity-10 absolute pointer-events-none font-mono text-[var(--cream)]">
            {stats.avgOverallScore}
          </div>
          <div className="relative z-10">
            <p className="text-[var(--olive)] text-xs font-bold tracking-[0.2em] mb-4 font-mono uppercase">
              AVG_PORTFOLIO_HEALTH
            </p>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold font-mono text-[var(--cream)]">{stats.avgOverallScore}</p>
              <span className="text-[var(--olive)] material-symbols-outlined mb-1">trending_up</span>
            </div>
            <p className="text-[10px] mt-2 opacity-50 font-light font-mono uppercase">
              CONFIDENCE_INTERVAL: 0.98
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="px-10 py-4 flex flex-wrap items-center justify-between border-b border-[var(--grid-line)]">
        <div className="flex gap-10">
          <button className="text-xs font-bold tracking-widest pb-4 pt-2 border-b-2 border-[var(--olive)] text-[var(--olive)] font-mono uppercase">
            GRID_VISUALIZER
          </button>
          <button className="text-xs font-bold tracking-widest pb-4 pt-2 opacity-40 hover:opacity-100 transition-opacity font-mono uppercase text-[var(--cream)]">
            TABLE_VIEW
          </button>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 border border-[var(--grid-line)] px-3 py-1.5 cursor-pointer hover:bg-[var(--olive)] hover:text-[var(--deep-black)] transition-colors group">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as Stage | 'all')}
              className="bg-transparent border-none text-[10px] font-bold font-mono uppercase focus:ring-0 cursor-pointer text-[var(--cream)] group-hover:text-[var(--deep-black)]"
            >
              <option value="all" className="bg-[var(--deep-black)] text-[var(--cream)]">STAGE: ALL</option>
              {STAGES.map((stage) => (
                <option key={stage.value} value={stage.value} className="bg-[var(--deep-black)] text-[var(--cream)]">
                  {stage.label.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 border border-[var(--grid-line)] px-3 py-1.5 cursor-pointer hover:bg-[var(--olive)] hover:text-[var(--deep-black)] transition-colors group">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as RiskLevel | 'all')}
              className="bg-transparent border-none text-[10px] font-bold font-mono uppercase focus:ring-0 cursor-pointer text-[var(--cream)] group-hover:text-[var(--deep-black)]"
            >
              <option value="all" className="bg-[var(--deep-black)] text-[var(--cream)]">STATUS: ALL</option>
              {RISK_LEVELS.map((risk) => (
                <option key={risk.value} value={risk.value} className="bg-[var(--deep-black)] text-[var(--cream)]">
                  {risk.label.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          {hasFilters && (
            <button
              onClick={() => {
                setStageFilter('all')
                setRiskFilter('all')
              }}
              className="text-[10px] font-bold font-mono uppercase text-[var(--cream)]/60 hover:text-[var(--cream)]"
            >
              CLEAR_FILTERS
            </button>
          )}
        </div>
      </section>

      {/* Startup List */}
      <section className="flex-1 p-10 space-y-px bg-[var(--grid-line)]">
        {filteredStartups.map((startup) => (
          <Link
            key={startup.id}
            href={`/partner/portfolio/${startup.id}`}
            className="bg-[var(--deep-black)] grid grid-cols-12 items-center p-6 gap-6 hover:bg-[#0a0a0a] transition-colors group"
          >
            <div className="col-span-1">
              <div className="size-12 border border-[var(--grid-line)] bg-black flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                {startup.logoUrl ? (
                  <img
                    alt={startup.name}
                    className="w-8 h-8 object-contain"
                    src={startup.logoUrl}
                  />
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center text-lg font-bold font-mono text-[var(--olive)]">
                    {startup.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-3">
              <h3 className="font-bold text-lg tracking-tight font-mono uppercase text-[var(--cream)]">
                {startup.name.replace(/ /g, '_').toUpperCase()}
              </h3>
              <p className="text-[10px] opacity-40 tracking-wider font-mono uppercase">
                {startup.industry.toUpperCase()}
              </p>
            </div>
            <div className="col-span-2">
              <span
                className={`text-[10px] border px-2 py-0.5 font-mono uppercase ${
                  startup.stage === 'growth'
                    ? 'border-[var(--olive)] text-[var(--olive)]'
                    : 'border-[var(--cream)]/20 text-[var(--cream)]/60'
                }`}
              >
                {startup.stage.toUpperCase()}_STAGE
              </span>
            </div>
            <div className="col-span-3">
              <div className="flex items-center gap-3">
                <div className={`size-2 ${getStatusColor(startup.riskLevel)}`} />
                <span className="text-xs tracking-widest font-mono uppercase text-[var(--cream)]/60">
                  {getStatusText(startup.riskLevel)}
                </span>
              </div>
            </div>
            <div className="col-span-1 flex flex-col items-center">
              <div className="score-block w-full py-1 text-center font-black text-xl font-mono">
                {startup.overallScore ?? '--'}
              </div>
              <span className="text-[8px] mt-1 opacity-40 tracking-tighter font-mono uppercase">
                IDX_SCORE
              </span>
            </div>
            <div className="col-span-2 flex justify-end">
              <span className="material-symbols-outlined text-[var(--cream)] opacity-20 group-hover:opacity-100 group-hover:text-[var(--olive)] transition-all">
                open_in_new
              </span>
            </div>
          </Link>
        ))}

        {filteredStartups.length === 0 && (
          <div className="bg-[var(--deep-black)] p-16 text-center">
            <p className="text-[var(--cream)]/40 font-mono uppercase text-sm">
              NO_ENTITIES_FOUND
            </p>
            <p className="text-[10px] text-[var(--cream)]/20 font-mono uppercase mt-2">
              Adjust filter parameters or initialize new entity
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="p-10 flex justify-between items-center border-t border-[var(--grid-line)]">
        <div className="flex gap-4 items-center">
          <span className="text-[10px] opacity-40 font-mono uppercase">SYSTEM_UPTIME: 99.9%</span>
          <div className="w-24 h-px bg-[var(--grid-line)]" />
          <span className="text-[10px] opacity-40 font-mono uppercase">LATENCY: 14MS</span>
        </div>
        <div className="flex gap-2">
          <button className="border border-[var(--grid-line)] size-10 flex items-center justify-center hover:bg-[var(--olive)] hover:text-[var(--deep-black)] transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button className="border border-[var(--grid-line)] size-10 flex items-center justify-center bg-[var(--cream)] text-[var(--deep-black)] font-bold text-xs font-mono">
            01
          </button>
          <button className="border border-[var(--grid-line)] size-10 flex items-center justify-center hover:bg-[var(--olive)] hover:text-[var(--deep-black)] transition-colors text-xs font-mono">
            02
          </button>
          <button className="border border-[var(--grid-line)] size-10 flex items-center justify-center hover:bg-[var(--olive)] hover:text-[var(--deep-black)] transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </footer>

      {/* Modal */}
      <AddStartupModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
}
