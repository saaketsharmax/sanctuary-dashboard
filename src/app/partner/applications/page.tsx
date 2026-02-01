'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PartnerHeader } from '@/components/partner/layout/partner-header'
import { getAllApplicationsWithFounders, getOnboardingStats } from '@/lib/mock-data'
import { APPLICATION_STAGES } from '@/types'

type FilterValue = 'all' | 'needs_review' | 'in_progress' | 'decided'

function getStatusStyle(status: string) {
  const configs: Record<string, { label: string; borderClass: string; textClass: string }> = {
    draft: { label: 'DRAFT', borderClass: 'border-[var(--cream)]/20', textClass: 'text-[var(--cream)]/40' },
    submitted: { label: 'SUBMITTED', borderClass: 'border-blue-500', textClass: 'text-blue-500' },
    interview_scheduled: { label: 'INTERVIEW_SCHEDULED', borderClass: 'border-purple-500', textClass: 'text-purple-500' },
    interview_completed: { label: 'INTERVIEW_DONE', borderClass: 'border-indigo-500', textClass: 'text-indigo-500' },
    assessment_generated: { label: 'ASSESSMENT_READY', borderClass: 'border-cyan-500', textClass: 'text-cyan-500' },
    under_review: { label: 'UNDER_REVIEW', borderClass: 'border-amber-500', textClass: 'text-amber-500' },
    approved: { label: 'APPROVED', borderClass: 'border-[var(--olive)]', textClass: 'text-[var(--olive)]' },
    rejected: { label: 'REJECTED', borderClass: 'border-[var(--warning)]', textClass: 'text-[var(--warning)]' },
    withdrawn: { label: 'WITHDRAWN', borderClass: 'border-[var(--cream)]/20', textClass: 'text-[var(--cream)]/40' },
  }
  return configs[status] || configs.draft
}

export default function PartnerApplicationsPage() {
  const [filter, setFilter] = useState<FilterValue>('all')

  const applications = getAllApplicationsWithFounders()
  const stats = getOnboardingStats()

  // Group applications by status for easy filtering
  const needsReview = applications.filter(
    (app) => ['submitted', 'interview_completed', 'assessment_generated'].includes(app.status)
  )
  const inProgress = applications.filter(
    (app) => ['interview_scheduled', 'under_review'].includes(app.status)
  )
  const decided = applications.filter(
    (app) => ['approved', 'rejected', 'withdrawn'].includes(app.status)
  )

  const filteredApplications = filter === 'all'
    ? applications
    : filter === 'needs_review'
    ? needsReview
    : filter === 'in_progress'
    ? inProgress
    : decided

  return (
    <div className="flex flex-col h-full bg-[var(--deep-black)]">
      <PartnerHeader
        title="APPLICANT_QUEUE"
        breadcrumb={['Applications']}
      />

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-5 border-b border-[var(--grid-line)]">
        <div className="p-6 border-r border-[var(--grid-line)]">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--olive)] mb-2">
            TOTAL_QUEUE
          </p>
          <p className="text-3xl font-black font-mono text-[var(--cream)]">{stats.totalApplications}</p>
        </div>
        <div className="p-6 border-r border-[var(--grid-line)]">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400 mb-2">
            NEEDS_REVIEW
          </p>
          <p className="text-3xl font-black font-mono text-blue-400">{needsReview.length}</p>
        </div>
        <div className="p-6 border-r border-[var(--grid-line)]">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500 mb-2">
            IN_PROGRESS
          </p>
          <p className="text-3xl font-black font-mono text-amber-500">{inProgress.length}</p>
        </div>
        <div className="p-6 border-r border-[var(--grid-line)]">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--olive)] mb-2">
            APPROVED
          </p>
          <p className="text-3xl font-black font-mono text-[var(--olive)]">{stats.approved}</p>
        </div>
        <div className="p-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--warning)] mb-2">
            REJECTED
          </p>
          <p className="text-3xl font-black font-mono text-[var(--warning)]">{stats.rejected}</p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="border-b border-[var(--grid-line)] px-10 flex gap-8">
        {[
          { value: 'all', label: `ALL_${applications.length}` },
          { value: 'needs_review', label: `NEEDS_REVIEW_${needsReview.length}` },
          { value: 'in_progress', label: `IN_PROGRESS_${inProgress.length}` },
          { value: 'decided', label: `DECIDED_${decided.length}` },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as FilterValue)}
            className={`py-4 text-xs font-bold tracking-widest font-mono uppercase transition-colors border-b-2 -mb-px ${
              filter === tab.value
                ? 'border-[var(--olive)] text-[var(--olive)]'
                : 'border-transparent text-[var(--cream)]/40 hover:text-[var(--cream)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="flex-1 overflow-auto p-10 space-y-px bg-[var(--grid-line)]">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((app) => {
            const statusConfig = getStatusStyle(app.status)
            const stageLabel = APPLICATION_STAGES.find((s) => s.value === app.stage)?.label || app.stage
            const leadFounder = app.founders.find((f) => f.isLead) || app.founders[0]

            return (
              <div
                key={app.id}
                className="bg-[var(--deep-black)] p-6 hover:bg-[#0a0a0a] transition-colors"
              >
                <div className="flex items-start gap-6">
                  <div className="size-14 border border-[var(--grid-line)] flex items-center justify-center">
                    <span className="text-xl font-bold font-mono text-[var(--olive)]">
                      {app.companyName.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold font-mono uppercase text-lg tracking-tight text-[var(--cream)]">
                          {app.companyName.replace(/ /g, '_').toUpperCase()}
                        </h3>
                        <p className="text-sm text-[var(--cream)]/60 line-clamp-1">
                          {app.companyOneLiner}
                        </p>
                      </div>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${statusConfig.borderClass} ${statusConfig.textClass}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-6 text-[10px] font-mono uppercase text-[var(--cream)]/60">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">person</span>
                        {leadFounder?.name}
                        {app.founders.length > 1 && ` +${app.founders.length - 1}`}
                      </div>
                      <div>
                        <span className="px-2 py-0.5 border border-[var(--cream)]/20">
                          {stageLabel.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        SUBMITTED: {app.submittedAt
                          ? new Date(app.submittedAt).toLocaleDateString().toUpperCase()
                          : 'N/A'}
                      </div>
                    </div>

                    {app.biggestChallenge && (
                      <div className="mt-4 p-4 border border-[var(--grid-line)]">
                        <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2">
                          BIGGEST_CHALLENGE
                        </p>
                        <p className="text-sm text-[var(--cream)]/80 line-clamp-2">{app.biggestChallenge}</p>
                      </div>
                    )}

                    <div className="mt-4 flex gap-4">
                      <Link
                        href={`/founder/interview/${app.id}`}
                        className="text-[10px] font-mono uppercase tracking-widest px-4 py-2 border border-[var(--cream)]/20 text-[var(--cream)]/60 hover:border-[var(--olive)] hover:text-[var(--olive)] transition-colors flex items-center gap-2"
                      >
                        VIEW_INTERVIEW
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                      {['assessment_generated', 'under_review'].includes(app.status) && (
                        <button className="text-[10px] font-mono uppercase tracking-widest px-4 py-2 bg-[var(--olive)] text-[var(--deep-black)] hover:bg-[var(--cream)] transition-colors">
                          REVIEW_ASSESSMENT
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-[var(--deep-black)] p-16 text-center">
            <span className="material-symbols-outlined text-4xl text-[var(--cream)]/20 mb-4">
              assignment
            </span>
            <p className="text-[var(--cream)]/40 font-mono uppercase text-sm">
              NO_APPLICATIONS_FOUND
            </p>
            <p className="text-[10px] text-[var(--cream)]/20 font-mono uppercase mt-2">
              No applications in this category
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
