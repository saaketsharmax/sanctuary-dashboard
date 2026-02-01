'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PartnerHeader } from '@/components/partner/layout/partner-header'
import { toast } from 'sonner'
import { EditStartupModal } from '@/components/startup/edit-startup-modal'
import { ScoreInputModal } from '@/components/startup/score-input-modal'
import { CheckpointFormModal } from '@/components/startup/checkpoint-form-modal'
import { EditFounderModal } from '@/components/startup/edit-founder-modal'
import { StartupMetricsPanel } from '@/components/metrics'
import { getStartupWithFounders, getCheckpointsByStartupId, getCohortById } from '@/lib/mock-data'
import type { Founder, Checkpoint, ScoreFormData, CheckpointFormData, FounderFormData } from '@/types'

interface StartupPageProps {
  params: Promise<{ id: string }>
}

type TabValue = 'overview' | 'founders' | 'checkpoints' | 'metrics'

export default function PartnerStartupPage({ params }: StartupPageProps) {
  const { id } = use(params)
  const startup = getStartupWithFounders(id)
  const checkpoints = getCheckpointsByStartupId(id)
  const cohort = startup ? getCohortById(startup.cohortId) ?? null : null

  // Tab state
  const [activeTab, setActiveTab] = useState<TabValue>('overview')

  // Modal states
  const [editStartupOpen, setEditStartupOpen] = useState(false)
  const [scoreInputOpen, setScoreInputOpen] = useState(false)
  const [checkpointFormOpen, setCheckpointFormOpen] = useState(false)
  const [editFounderOpen, setEditFounderOpen] = useState(false)
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null)
  const [selectedFounder, setSelectedFounder] = useState<Founder | null>(null)
  const [isNewFounder, setIsNewFounder] = useState(false)

  if (!startup) {
    notFound()
  }

  // Handlers
  const handleEditStartup = () => {
    setEditStartupOpen(true)
  }

  const handleEditStartupSuccess = (data: { name: string }) => {
    toast.success('Startup updated', {
      description: `${data.name} has been updated successfully.`,
    })
  }

  const handleUpdateScores = () => {
    setScoreInputOpen(true)
  }

  const handleScoreSuccess = (data: ScoreFormData) => {
    toast.success('Scores updated', {
      description: `Overall score: ${Math.round((data.founderScore + data.problemScore + data.userValueScore + data.executionScore) / 4)}`,
    })
  }

  const handleAddCheckpoint = () => {
    setSelectedCheckpoint(null)
    setCheckpointFormOpen(true)
  }

  const handleEditCheckpoint = (checkpoint: Checkpoint) => {
    setSelectedCheckpoint(checkpoint)
    setCheckpointFormOpen(true)
  }

  const handleCheckpointSuccess = (data: CheckpointFormData) => {
    const action = selectedCheckpoint ? 'updated' : 'added'
    toast.success(`Checkpoint ${action}`, {
      description: `Week ${data.weekNumber} checkpoint has been ${action}.`,
    })
  }

  const handleAddFounder = () => {
    setSelectedFounder(null)
    setIsNewFounder(true)
    setEditFounderOpen(true)
  }

  const handleEditFounder = (founder: Founder) => {
    setSelectedFounder(founder)
    setIsNewFounder(false)
    setEditFounderOpen(true)
  }

  const handleFounderSuccess = (data: FounderFormData) => {
    const action = isNewFounder ? 'added' : 'updated'
    toast.success(`Founder ${action}`, {
      description: `${data.name} has been ${action} successfully.`,
    })
  }

  const existingWeeks = checkpoints.map((c) => c.weekNumber)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[var(--olive)]'
      case 'in_progress':
        return 'bg-blue-500'
      case 'blocked':
        return 'bg-[var(--warning)]'
      default:
        return 'bg-[var(--cream)]/40'
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PartnerHeader
        title={startup.name.replace(/ /g, '_').toUpperCase()}
        breadcrumb={['Portfolio', startup.name]}
        action={{
          label: 'Edit Entity',
          onClick: handleEditStartup,
        }}
      />

      <div className="flex-1 overflow-auto">
        {/* Back Link */}
        <div className="px-10 py-4 border-b border-[var(--grid-line)]">
          <Link
            href="/partner/portfolio"
            className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--cream)]/40 hover:text-[var(--olive)] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            RETURN_TO_PORTFOLIO
          </Link>
        </div>

        {/* Hero Section - Score Display */}
        <section className="flex flex-col lg:flex-row border-b border-[var(--grid-line)]">
          {/* Score Panel */}
          <div className="lg:w-2/3 p-10 lg:p-16 flex flex-col justify-between border-r border-[var(--grid-line)] bg-gradient-to-br from-[var(--deep-black)] to-[#0a0a0a]">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--olive)] mb-2 block">
                COMPOSITE_RANK_INDEX
              </span>
              <h1 className="text-[clamp(8rem,25vw,18rem)] leading-[0.8] tracking-tighter font-bold text-[var(--cream)]">
                {startup.overallScore ?? '--'}
              </h1>
              <div className="flex items-center gap-4 mt-8">
                <span className="text-[var(--olive)] font-mono text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  +2.4 vs. last batch
                </span>
                <div className="h-px w-24 bg-[var(--olive)]/30" />
                <span className="text-[var(--cream)]/40 font-mono text-[11px] uppercase tracking-wider">
                  Quantifiable Performance Metric
                </span>
              </div>
            </div>
            <div className="mt-16 lg:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border border-[var(--grid-line)] bg-white/5">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--olive)] mb-2 block">
                  FOUNDER
                </span>
                <p className="text-2xl font-mono text-[var(--cream)]">{startup.founderScore ?? '--'}</p>
              </div>
              <div className="p-4 border border-[var(--grid-line)] bg-white/5">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--olive)] mb-2 block">
                  PROBLEM
                </span>
                <p className="text-2xl font-mono text-[var(--cream)]">{startup.problemScore ?? '--'}</p>
              </div>
              <div className="p-4 border border-[var(--grid-line)] bg-white/5">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--olive)] mb-2 block">
                  VALUE
                </span>
                <p className="text-2xl font-mono text-[var(--cream)]">{startup.userValueScore ?? '--'}</p>
              </div>
              <div className="p-4 border border-[var(--grid-line)] bg-white/5">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--olive)] mb-2 block">
                  EXECUTION
                </span>
                <p className="text-2xl font-mono text-[var(--cream)]">{startup.executionScore ?? '--'}</p>
              </div>
            </div>
            <button
              onClick={handleUpdateScores}
              className="mt-6 text-[10px] font-mono uppercase tracking-widest text-[var(--olive)] hover:text-[var(--cream)] transition-colors self-start flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              UPDATE_SCORES
            </button>
          </div>

          {/* Entity Info Panel */}
          <div className="lg:w-1/3 flex flex-col">
            <div className="p-12 flex flex-col items-center text-center border-b border-[var(--grid-line)]">
              {startup.logoUrl ? (
                <div
                  className="size-32 bg-center bg-cover mb-8 grayscale hover:grayscale-0 transition-all duration-500 border border-[var(--cream)]/10"
                  style={{ backgroundImage: `url("${startup.logoUrl}")` }}
                />
              ) : (
                <div className="size-32 border border-[var(--grid-line)] mb-8 flex items-center justify-center">
                  <span className="text-5xl font-bold font-mono text-[var(--olive)]">
                    {startup.name.charAt(0)}
                  </span>
                </div>
              )}
              <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase font-mono text-[var(--cream)]">
                {startup.name}
              </h2>
              <p className="text-[var(--olive)] font-mono text-[11px] tracking-[0.2em] mb-6 uppercase">
                {cohort?.name ?? 'BATCH_UNKNOWN'} / {startup.stage.toUpperCase()}
              </p>
              <div className="w-12 h-0.5 bg-[var(--olive)] mb-6" />
              <p className="text-[var(--cream)]/60 text-sm leading-relaxed max-w-xs mx-auto">
                {startup.description}
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2">
              <div className="p-6 border-r border-[var(--grid-line)] flex flex-col justify-center items-center">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--olive)] mb-1">
                  STATUS
                </span>
                <span className="text-[var(--olive)] text-xs font-mono tracking-widest">
                  {startup.status.toUpperCase()}_NODE
                </span>
              </div>
              <div className="p-6 flex flex-col justify-center items-center">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--olive)] mb-1">
                  SECTOR
                </span>
                <span className="text-[var(--cream)] text-xs font-mono">
                  {startup.industry.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="border-b border-[var(--grid-line)] px-10 flex gap-8">
          {(['overview', 'founders', 'checkpoints', 'metrics'] as TabValue[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-xs font-bold tracking-widest font-mono uppercase transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-[var(--olive)] text-[var(--olive)]'
                  : 'border-transparent text-[var(--cream)]/40 hover:text-[var(--cream)]'
              }`}
            >
              {tab.replace('_', '_')}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-10">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-4 gap-px bg-[var(--grid-line)]">
              {/* Core Proposition */}
              <div className="lg:col-span-2 p-8 bg-[var(--deep-black)]">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--olive)] mb-4 block">
                  CORE_PROPOSITION
                </span>
                <p className="text-xl text-[var(--cream)]/90 leading-relaxed font-light">
                  {startup.description}
                </p>
                <div className="grid grid-cols-2 gap-8 mt-8">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--olive)] mb-3 block">
                      MARKET_SEGMENT
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 border border-[var(--cream)]/20 text-[10px] font-mono uppercase">
                        {startup.industry}
                      </span>
                      <span className="px-2 py-1 border border-[var(--cream)]/20 text-[10px] font-mono uppercase">
                        {startup.businessModel}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--olive)] mb-3 block">
                      DIGITAL_ASSET
                    </span>
                    {startup.website && (
                      <a
                        href={startup.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--cream)] hover:text-[var(--olive)] transition-colors flex items-center gap-2 font-mono text-xs"
                      >
                        {startup.website.replace(/https?:\/\//, '').toUpperCase()}
                        <span className="material-symbols-outlined text-sm">north_east</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div className="p-8 bg-[var(--deep-black)]">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--olive)] mb-4 block">
                  CRITICAL_MILESTONES
                </span>
                <div className="space-y-6 mt-4">
                  {checkpoints.slice(0, 3).map((checkpoint) => (
                    <div key={checkpoint.id} className="relative pl-6 border-l border-[var(--olive)]/30">
                      <div className={`absolute -left-1 top-0 size-2 ${getStatusColor(checkpoint.status)}`} />
                      <p className="text-sm font-bold text-[var(--cream)] mb-1">
                        WEEK_{checkpoint.weekNumber} — {checkpoint.goal || 'Goal pending'}
                      </p>
                      <p className="text-xs text-[var(--cream)]/50 leading-relaxed">
                        {checkpoint.partnerNotes || checkpoint.founderNotes || 'No notes available'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Founders Preview */}
              <div className="p-8 bg-white/[0.02]">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--olive)] mb-4 block">
                  FOUNDER_REGISTRY
                </span>
                <div className="space-y-4">
                  {startup.founders.slice(0, 3).map((founder) => (
                    <div key={founder.id} className="flex items-center gap-3 group cursor-pointer">
                      {founder.photoUrl ? (
                        <div
                          className="size-8 border border-[var(--cream)]/20 bg-cover bg-center group-hover:border-[var(--olive)]"
                          style={{ backgroundImage: `url("${founder.photoUrl}")` }}
                        />
                      ) : (
                        <div className="size-8 border border-[var(--cream)]/20 flex items-center justify-center group-hover:border-[var(--olive)]">
                          <span className="text-xs font-mono text-[var(--cream)]/60">
                            {founder.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-[11px] font-mono opacity-60 group-hover:opacity-100 block">
                          {founder.name.toUpperCase()}
                        </span>
                        <span className="text-[9px] font-mono text-[var(--olive)]">
                          {founder.role.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('founders')}
                  className="mt-6 text-[10px] font-mono uppercase tracking-widest text-[var(--cream)]/40 hover:text-[var(--olive)] transition-colors flex items-center gap-2"
                >
                  VIEW_ALL_FOUNDERS
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* Founders Tab */}
          {activeTab === 'founders' && (
            <div className="space-y-px bg-[var(--grid-line)]">
              <div className="bg-[var(--deep-black)] p-6 flex items-center justify-between">
                <h3 className="font-bold font-mono uppercase tracking-wider text-[var(--cream)]">
                  FOUNDER_DATABASE
                </h3>
                <button
                  onClick={handleAddFounder}
                  className="px-4 py-2 bg-[var(--olive)] text-[var(--deep-black)] text-[10px] font-bold font-mono uppercase tracking-widest hover:bg-[var(--cream)] transition-colors"
                >
                  ADD_FOUNDER
                </button>
              </div>
              {startup.founders.map((founder) => (
                <div
                  key={founder.id}
                  className="bg-[var(--deep-black)] p-6 flex items-center justify-between hover:bg-[#0a0a0a] transition-colors group"
                >
                  <div className="flex items-center gap-6">
                    {founder.photoUrl ? (
                      <div
                        className="size-16 border border-[var(--grid-line)] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all"
                        style={{ backgroundImage: `url("${founder.photoUrl}")` }}
                      />
                    ) : (
                      <div className="size-16 border border-[var(--grid-line)] flex items-center justify-center">
                        <span className="text-2xl font-bold font-mono text-[var(--olive)]">
                          {founder.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold font-mono uppercase text-lg tracking-tight text-[var(--cream)]">
                        {founder.name.replace(/ /g, '_').toUpperCase()}
                      </h4>
                      <p className="text-[10px] text-[var(--olive)] font-mono uppercase tracking-wider">
                        {founder.role}
                      </p>
                      <p className="text-xs text-[var(--cream)]/40 font-mono mt-1">
                        {founder.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {founder.linkedin && (
                      <a
                        href={founder.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--cream)]/40 hover:text-[var(--olive)] transition-colors"
                      >
                        <span className="material-symbols-outlined">link</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleEditFounder(founder)}
                      className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 border border-[var(--cream)]/20 text-[var(--cream)]/60 hover:border-[var(--olive)] hover:text-[var(--olive)] transition-colors"
                    >
                      MODIFY
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Checkpoints Tab */}
          {activeTab === 'checkpoints' && (
            <div className="space-y-px bg-[var(--grid-line)]">
              <div className="bg-[var(--deep-black)] p-6 flex items-center justify-between">
                <h3 className="font-bold font-mono uppercase tracking-wider text-[var(--cream)]">
                  CHECKPOINT_TIMELINE
                </h3>
                <button
                  onClick={handleAddCheckpoint}
                  className="px-4 py-2 bg-[var(--olive)] text-[var(--deep-black)] text-[10px] font-bold font-mono uppercase tracking-widest hover:bg-[var(--cream)] transition-colors"
                >
                  ADD_CHECKPOINT
                </button>
              </div>
              {checkpoints.length > 0 ? (
                checkpoints.map((checkpoint) => (
                  <div
                    key={checkpoint.id}
                    className="bg-[var(--deep-black)] p-6 hover:bg-[#0a0a0a] transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-6">
                        <div className="flex flex-col items-center">
                          <div className={`size-3 ${getStatusColor(checkpoint.status)}`} />
                          <div className="w-px h-full bg-[var(--grid-line)] mt-2" />
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[var(--olive)] text-[var(--deep-black)]">
                              WEEK_{checkpoint.weekNumber}
                            </span>
                            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                              checkpoint.status === 'completed'
                                ? 'border-[var(--olive)] text-[var(--olive)]'
                                : checkpoint.status === 'in_progress'
                                ? 'border-blue-500 text-blue-500'
                                : checkpoint.status === 'blocked'
                                ? 'border-[var(--warning)] text-[var(--warning)]'
                                : 'border-[var(--cream)]/20 text-[var(--cream)]/60'
                            }`}>
                              {checkpoint.status.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="font-bold font-mono uppercase text-lg tracking-tight text-[var(--cream)]">
                            {checkpoint.goal || 'Goal pending'}
                          </h4>
                          <p className="text-sm text-[var(--cream)]/60 mt-2 max-w-2xl">
                            {checkpoint.checkpointQuestion || 'No checkpoint question set'}
                          </p>
                          {checkpoint.partnerNotes && (
                            <p className="text-xs text-[var(--cream)]/40 font-mono mt-3 italic">
                              // {checkpoint.partnerNotes}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditCheckpoint(checkpoint)}
                        className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 border border-[var(--cream)]/20 text-[var(--cream)]/60 hover:border-[var(--olive)] hover:text-[var(--olive)] transition-colors"
                      >
                        MODIFY
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[var(--deep-black)] p-16 text-center">
                  <span className="material-symbols-outlined text-4xl text-[var(--cream)]/20 mb-4">
                    timeline
                  </span>
                  <p className="text-[var(--cream)]/40 font-mono uppercase text-sm">
                    NO_CHECKPOINTS_FOUND
                  </p>
                  <p className="text-[10px] text-[var(--cream)]/20 font-mono uppercase mt-2">
                    Initialize first checkpoint to begin tracking
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <StartupMetricsPanel startupId={startup.id} />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 border-t border-[var(--grid-line)] flex justify-between items-center px-10">
        <div className="flex items-center gap-6 font-mono text-[9px] opacity-40 uppercase tracking-widest">
          <span>ENTITY_ID: {startup.id}</span>
          <span>ENCRYPTED_SESSION</span>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 border border-[var(--cream)]/20 text-xs font-mono uppercase tracking-widest hover:bg-[var(--cream)] hover:text-[var(--deep-black)] transition-all">
            EXPORT_REPORT
          </button>
          <button
            onClick={handleEditStartup}
            className="px-6 py-2 bg-[var(--olive)] text-[var(--deep-black)] text-xs font-mono uppercase tracking-widest hover:bg-[var(--cream)] transition-all"
          >
            MODIFY_NODE
          </button>
        </div>
      </footer>

      {/* Modals */}
      <EditStartupModal
        open={editStartupOpen}
        onOpenChange={setEditStartupOpen}
        startup={startup}
        onSuccess={handleEditStartupSuccess}
      />

      <ScoreInputModal
        open={scoreInputOpen}
        onOpenChange={setScoreInputOpen}
        startup={startup}
        onSuccess={handleScoreSuccess}
      />

      <CheckpointFormModal
        open={checkpointFormOpen}
        onOpenChange={setCheckpointFormOpen}
        startupName={startup.name}
        checkpoint={selectedCheckpoint}
        existingWeeks={existingWeeks}
        onSuccess={handleCheckpointSuccess}
      />

      <EditFounderModal
        open={editFounderOpen}
        onOpenChange={setEditFounderOpen}
        founder={selectedFounder}
        isNew={isNewFounder}
        onSuccess={handleFounderSuccess}
      />
    </div>
  )
}
