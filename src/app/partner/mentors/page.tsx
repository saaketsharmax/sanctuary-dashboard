'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PartnerHeader } from '@/components/partner/layout/partner-header'
import { ExpertiseBadge } from '@/components/mentors'
import {
  getActiveMentors,
  bottlenecks,
  matches,
  getMatchWithDetails,
  getMatchStats,
  startups,
  getMentorById,
} from '@/lib/mock-data'
import { PROBLEM_ARCHETYPES, getStageInfo } from '@/types'

type TabValue = 'dashboard' | 'mentors' | 'matches' | 'needs'

export default function PartnerMentorMatchingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expertiseFilter, setExpertiseFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<TabValue>('dashboard')

  const mentors = getActiveMentors()
  const stats = getMatchStats()

  // Startups needing help (have bottlenecks)
  const startupsNeedingHelp = bottlenecks.map((b) => {
    const startup = startups.find((s) => s.id === b.startupId)
    return { bottleneck: b, startup }
  }).filter((item) => item.startup)

  // Recent/pending matches
  const pendingMatches = matches
    .filter((m) => m.status === 'pending')
    .slice(0, 5)
    .map((m) => getMatchWithDetails(m.id))
    .filter((m) => m !== undefined)

  // Mentors available for investment
  const investorMentors = mentors.filter((m) => m.availableForInvestment)

  // Filter mentors
  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      searchQuery === '' ||
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.bio.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesExpertise =
      expertiseFilter === 'all' || mentor.expertise.includes(expertiseFilter as never)

    return matchesSearch && matchesExpertise
  })

  return (
    <div className="flex flex-col h-full bg-[var(--deep-black)]">
      <PartnerHeader
        title="MENTOR_NETWORK"
        breadcrumb={['Mentors']}
        action={{
          label: 'Add Mentor',
          onClick: () => {},
        }}
      />

      {/* Stats Bar */}
      <section className="grid grid-cols-2 md:grid-cols-5 border-b border-[var(--grid-line)]">
        <div className="p-6 border-r border-[var(--grid-line)]">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--olive)] mb-2">
            ACTIVE_MENTORS
          </p>
          <p className="text-3xl font-black font-mono text-[var(--cream)]">{mentors.length}</p>
        </div>
        <div className="p-6 border-r border-[var(--grid-line)]">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500 mb-2">
            NEEDS_HELP
          </p>
          <p className="text-3xl font-black font-mono text-amber-500">{startupsNeedingHelp.length}</p>
        </div>
        <div className="p-6 border-r border-[var(--grid-line)]">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-400 mb-2">
            PENDING_MATCHES
          </p>
          <p className="text-3xl font-black font-mono text-purple-400">{stats.pending}</p>
        </div>
        <div className="p-6 border-r border-[var(--grid-line)]">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--olive)] mb-2">
            COMPLETED
          </p>
          <p className="text-3xl font-black font-mono text-[var(--olive)]">{stats.completed + stats.introsSent}</p>
        </div>
        <div className="p-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 mb-2">
            INVESTOR_MENTORS
          </p>
          <p className="text-3xl font-black font-mono text-emerald-400">{investorMentors.length}</p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="border-b border-[var(--grid-line)] px-10 flex gap-8">
        {[
          { value: 'dashboard', label: 'DASHBOARD' },
          { value: 'mentors', label: `MENTORS_${mentors.length}` },
          { value: 'matches', label: `MATCHES_${stats.total}` },
          { value: 'needs', label: `NEEDS_HELP_${startupsNeedingHelp.length}` },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as TabValue)}
            className={`py-4 text-xs font-bold tracking-widest font-mono uppercase transition-colors border-b-2 -mb-px ${
              activeTab === tab.value
                ? 'border-[var(--olive)] text-[var(--olive)]'
                : 'border-transparent text-[var(--cream)]/40 hover:text-[var(--cream)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-10">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-px bg-[var(--grid-line)]">
              {/* Startups Needing Help */}
              <div className="bg-[var(--deep-black)]">
                <div className="px-6 py-4 border-b border-[var(--grid-line)] flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-500">warning</span>
                  <h3 className="font-bold font-mono uppercase tracking-wider text-[var(--cream)]">
                    STARTUPS_NEEDING_HELP
                  </h3>
                </div>
                <div className="p-4 space-y-px bg-[var(--grid-line)]">
                  {startupsNeedingHelp.slice(0, 4).map(({ bottleneck, startup }) => (
                    <Link
                      key={bottleneck.id}
                      href={`/partner/portfolio/${startup!.id}`}
                      className="block bg-[var(--deep-black)] p-4 hover:bg-[#0a0a0a] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="size-10 border border-[var(--grid-line)] flex items-center justify-center">
                            <span className="text-[var(--cream)]/60 font-bold font-mono">
                              {startup!.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold font-mono uppercase text-sm tracking-tight text-[var(--cream)]">
                              {startup!.name.replace(/ /g, '_').toUpperCase()}
                            </p>
                            <p className="text-[10px] text-[var(--cream)]/40 font-mono line-clamp-1 max-w-xs">
                              {bottleneck.rawBlocker.slice(0, 60)}...
                            </p>
                          </div>
                        </div>
                        <ExpertiseBadge archetype={bottleneck.problemArchetype} size="sm" />
                      </div>
                    </Link>
                  ))}
                  {startupsNeedingHelp.length === 0 && (
                    <div className="bg-[var(--deep-black)] p-8 text-center">
                      <p className="text-[var(--cream)]/40 font-mono uppercase text-sm">
                        NO_STARTUPS_NEED_HELP
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pending Matches */}
              <div className="bg-[var(--deep-black)]">
                <div className="px-6 py-4 border-b border-[var(--grid-line)] flex items-center gap-3">
                  <span className="material-symbols-outlined text-purple-400">handshake</span>
                  <h3 className="font-bold font-mono uppercase tracking-wider text-[var(--cream)]">
                    PENDING_MATCHES
                  </h3>
                </div>
                <div className="p-4 space-y-px bg-[var(--grid-line)]">
                  {pendingMatches.slice(0, 4).map((match) => {
                    const mentor = getMentorById(match.mentorId)
                    const isInvestor = mentor?.investedStartupIds.includes(match.startup.id)
                    return (
                      <Link
                        key={match.id}
                        href={`/partner/matches/${match.id}`}
                        className="block bg-[var(--deep-black)] p-4 hover:bg-[#0a0a0a] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="score-block size-10 flex items-center justify-center font-black font-mono">
                              {match.score}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold font-mono uppercase text-sm tracking-tight text-[var(--cream)]">
                                  {match.mentor.name.replace(/ /g, '_').toUpperCase()}
                                </p>
                                {isInvestor && (
                                  <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400">
                                    INVESTOR
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[var(--cream)]/40 font-mono">
                                → {match.startup.name.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-[var(--olive)] text-[var(--olive)]">
                            {match.confidence}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                  {pendingMatches.length === 0 && (
                    <div className="bg-[var(--deep-black)] p-8 text-center">
                      <p className="text-[var(--cream)]/40 font-mono uppercase text-sm">
                        NO_PENDING_MATCHES
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Investor Mentors */}
            <div className="bg-[var(--deep-black)] border border-[var(--grid-line)]">
              <div className="px-6 py-4 border-b border-[var(--grid-line)] flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-400">attach_money</span>
                <h3 className="font-bold font-mono uppercase tracking-wider text-[var(--cream)]">
                  INVESTOR_MENTORS
                </h3>
              </div>
              <div className="p-4 grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--grid-line)]">
                {investorMentors.slice(0, 4).map((mentor) => (
                  <Link
                    key={mentor.id}
                    href={`/partner/mentors/${mentor.id}`}
                    className="bg-[var(--deep-black)] p-4 hover:bg-[#0a0a0a] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {mentor.photoUrl ? (
                        <div
                          className="size-10 border border-[var(--grid-line)] bg-cover bg-center"
                          style={{ backgroundImage: `url("${mentor.photoUrl}")` }}
                        />
                      ) : (
                        <div className="size-10 border border-[var(--grid-line)] flex items-center justify-center">
                          <span className="text-sm font-bold font-mono text-[var(--olive)]">
                            {mentor.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-bold font-mono uppercase text-sm tracking-tight text-[var(--cream)]">
                          {mentor.name}
                        </p>
                        <p className="text-[10px] text-emerald-400 font-mono">
                          {mentor.checkSize}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mentors Tab */}
        {activeTab === 'mentors' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--cream)]/40">
                  search
                </span>
                <input
                  type="text"
                  placeholder="SEARCH_MENTORS"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border border-[var(--grid-line)] py-2 pl-10 pr-4 text-xs tracking-widest font-mono uppercase focus:ring-0 focus:outline-none focus:border-[var(--olive)] placeholder:text-[var(--cream)]/30 text-[var(--cream)]"
                />
              </div>
              <select
                value={expertiseFilter}
                onChange={(e) => setExpertiseFilter(e.target.value)}
                className="bg-transparent border border-[var(--grid-line)] px-3 py-2 text-xs font-mono uppercase focus:ring-0 focus:outline-none focus:border-[var(--olive)] text-[var(--cream)] sm:w-[200px]"
              >
                <option value="all" className="bg-[var(--deep-black)]">ALL_EXPERTISE</option>
                {PROBLEM_ARCHETYPES.map((archetype) => (
                  <option key={archetype.value} value={archetype.value} className="bg-[var(--deep-black)]">
                    {archetype.label.toUpperCase()}
                  </option>
                ))}
              </select>
              {(searchQuery || expertiseFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setExpertiseFilter('all')
                  }}
                  className="text-[10px] font-mono uppercase tracking-widest text-[var(--cream)]/60 hover:text-[var(--cream)]"
                >
                  CLEAR
                </button>
              )}
            </div>

            <p className="text-[10px] font-mono uppercase text-[var(--cream)]/40">
              SHOWING {filteredMentors.length} OF {mentors.length} MENTORS
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--grid-line)]">
              {filteredMentors.map((mentor) => (
                <Link
                  key={mentor.id}
                  href={`/partner/mentors/${mentor.id}`}
                  className="bg-[var(--deep-black)] p-6 hover:bg-[#0a0a0a] transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    {mentor.photoUrl ? (
                      <div
                        className="size-16 border border-[var(--grid-line)] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all"
                        style={{ backgroundImage: `url("${mentor.photoUrl}")` }}
                      />
                    ) : (
                      <div className="size-16 border border-[var(--grid-line)] flex items-center justify-center">
                        <span className="text-2xl font-bold font-mono text-[var(--olive)]">
                          {mentor.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold font-mono uppercase tracking-tight text-[var(--cream)] group-hover:text-[var(--olive)] transition-colors">
                        {mentor.name.replace(/ /g, '_').toUpperCase()}
                      </h4>
                      <p className="text-[10px] text-[var(--cream)]/40 font-mono mt-1 line-clamp-2">
                        {mentor.bio}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {mentor.expertise.slice(0, 2).map((exp) => (
                          <span key={exp} className="text-[8px] font-mono uppercase px-1.5 py-0.5 border border-[var(--cream)]/20 text-[var(--cream)]/60">
                            {exp}
                          </span>
                        ))}
                        {mentor.expertise.length > 2 && (
                          <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 text-[var(--cream)]/40">
                            +{mentor.expertise.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    {mentor.availableForInvestment && (
                      <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400">
                        INVESTOR
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="space-y-px bg-[var(--grid-line)]">
            {matches
              .sort((a, b) => b.score - a.score)
              .map((match) => {
                const details = getMatchWithDetails(match.id)
                if (!details) return null
                return (
                  <Link
                    key={match.id}
                    href={`/partner/matches/${match.id}`}
                    className="bg-[var(--deep-black)] p-6 block hover:bg-[#0a0a0a] transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="score-block size-14 flex items-center justify-center font-black font-mono text-xl">
                          {details.score}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold font-mono uppercase tracking-tight text-[var(--cream)]">
                              {details.mentor.name.replace(/ /g, '_').toUpperCase()}
                            </p>
                            <span className="text-[var(--cream)]/40">→</span>
                            <p className="font-bold font-mono uppercase tracking-tight text-[var(--olive)]">
                              {details.startup.name.replace(/ /g, '_').toUpperCase()}
                            </p>
                          </div>
                          <p className="text-[10px] text-[var(--cream)]/40 font-mono mt-1">
                            {details.explanation}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                          details.status === 'completed'
                            ? 'border-[var(--olive)] text-[var(--olive)]'
                            : details.status === 'pending'
                            ? 'border-purple-400 text-purple-400'
                            : 'border-[var(--cream)]/20 text-[var(--cream)]/60'
                        }`}>
                          {details.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-[var(--olive)] text-[var(--olive)]">
                          {details.confidence}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
          </div>
        )}

        {/* Needs Help Tab */}
        {activeTab === 'needs' && (
          <div className="space-y-px bg-[var(--grid-line)]">
            {startupsNeedingHelp.map(({ bottleneck, startup }) => {
              const stageInfo = getStageInfo(startup!.stage)
              const matchCount = matches.filter((m) => m.bottleneckId === bottleneck.id).length
              return (
                <div key={bottleneck.id} className="bg-[var(--deep-black)] p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <Link
                          href={`/partner/portfolio/${startup!.id}`}
                          className="font-bold font-mono uppercase tracking-tight text-[var(--cream)] hover:text-[var(--olive)] transition-colors"
                        >
                          {startup!.name.replace(/ /g, '_').toUpperCase()}
                        </Link>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-[var(--cream)]/20 text-[var(--cream)]/60">
                          {stageInfo.label}
                        </span>
                        <ExpertiseBadge archetype={bottleneck.problemArchetype} />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-1">BLOCKING_ISSUE</p>
                          <p className="text-sm text-[var(--cream)]/80">{bottleneck.rawBlocker}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-1">ATTEMPTED_SOLUTIONS</p>
                          <p className="text-sm text-[var(--cream)]/80">{bottleneck.rawAttempts}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-1">SUCCESS_CRITERIA</p>
                          <p className="text-sm text-[var(--cream)]/80">{bottleneck.rawSuccessCriteria}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-8">
                      <p className="text-4xl font-black font-mono text-[var(--cream)]">{matchCount}</p>
                      <p className="text-[10px] text-[var(--cream)]/40 font-mono uppercase">MATCHES_FOUND</p>
                      <span className={`inline-block mt-2 text-[10px] font-mono uppercase px-2 py-0.5 ${
                        bottleneck.status === 'matched'
                          ? 'bg-[var(--olive)]/20 text-[var(--olive)]'
                          : 'bg-amber-500/20 text-amber-500'
                      }`}>
                        {bottleneck.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
