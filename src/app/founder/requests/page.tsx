'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { FounderHeader } from '@/components/founder/layout/founder-header'

type RequestStatus = 'pending' | 'in_review' | 'approved' | 'completed' | 'declined'

// Mock requests for demo
const mockRequests: Array<{
  id: string
  requestType: 'mentor' | 'feature' | 'feedback'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: RequestStatus
  createdAt: string
  responseNotes: string | null
}> = [
  {
    id: 'req-1',
    requestType: 'mentor',
    title: 'Need help with sales strategy',
    description: 'Looking for a mentor with B2B SaaS sales experience to help refine our outbound strategy.',
    priority: 'high',
    status: 'in_review',
    createdAt: '2026-01-20T10:00:00Z',
    responseNotes: null,
  },
  {
    id: 'req-2',
    requestType: 'feature',
    title: 'Request: Export metrics to CSV',
    description: 'Would be helpful to export our metrics data for board presentations.',
    priority: 'medium',
    status: 'approved',
    createdAt: '2026-01-15T14:30:00Z',
    responseNotes: 'Added to the roadmap for Q2!',
  },
  {
    id: 'req-3',
    requestType: 'feedback',
    title: 'Dashboard loading slowly',
    description: 'The metrics dashboard takes a long time to load when there is a lot of data.',
    priority: 'low',
    status: 'completed',
    createdAt: '2026-01-10T09:15:00Z',
    responseNotes: 'Fixed in the latest update. Please refresh and let us know if the issue persists.',
  },
]

function getRequestTypeConfig(type: string) {
  switch (type) {
    case 'mentor':
      return { icon: 'school', label: 'MENTOR', color: 'text-purple-500' }
    case 'feature':
      return { icon: 'lightbulb', label: 'FEATURE', color: 'text-amber-500' }
    case 'feedback':
      return { icon: 'chat', label: 'FEEDBACK', color: 'text-blue-500' }
    default:
      return { icon: 'help', label: 'OTHER', color: 'text-[var(--cream)]/60' }
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'pending':
      return { label: 'PENDING', borderClass: 'border-[var(--cream)]/20', textClass: 'text-[var(--cream)]/40' }
    case 'in_review':
      return { label: 'IN_REVIEW', borderClass: 'border-blue-500', textClass: 'text-blue-500' }
    case 'approved':
      return { label: 'APPROVED', borderClass: 'border-[var(--olive)]', textClass: 'text-[var(--olive)]' }
    case 'completed':
      return { label: 'COMPLETED', borderClass: 'border-[var(--olive)]', textClass: 'text-[var(--olive)]' }
    case 'declined':
      return { label: 'DECLINED', borderClass: 'border-[var(--warning)]', textClass: 'text-[var(--warning)]' }
    default:
      return { label: status.toUpperCase(), borderClass: 'border-[var(--cream)]/20', textClass: 'text-[var(--cream)]/40' }
  }
}

function getPriorityConfig(priority: string) {
  switch (priority) {
    case 'high':
      return { label: 'HIGH', color: 'text-[var(--warning)]', bgColor: 'bg-[var(--warning)]/10' }
    case 'medium':
      return { label: 'MEDIUM', color: 'text-amber-500', bgColor: 'bg-amber-500/10' }
    case 'low':
      return { label: 'LOW', color: 'text-[var(--olive)]', bgColor: 'bg-[var(--olive)]/10' }
    default:
      return { label: 'NORMAL', color: 'text-[var(--cream)]/60', bgColor: 'bg-[var(--cream)]/5' }
  }
}

export default function FounderRequestsPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--deep-black)]">
        <div className="animate-pulse text-[var(--cream)]/40 font-mono uppercase">LOADING...</div>
      </div>
    )
  }

  if (!session?.user) {
    redirect('/login')
  }

  const startupId = session.user.startupId

  if (!startupId) {
    redirect('/founder/dashboard')
  }

  return (
    <div className="flex flex-col h-full bg-[var(--deep-black)]">
      <FounderHeader
        title="SUPPORT_CENTER"
        breadcrumb={['Requests']}
      />

      {/* Quick Actions */}
      <section className="grid md:grid-cols-3 border-b border-[var(--grid-line)]">
        <button className="p-8 border-r border-[var(--grid-line)] hover:bg-[#0a0a0a] transition-colors group text-left">
          <span className="material-symbols-outlined text-3xl text-purple-500 mb-4">school</span>
          <h3 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)] group-hover:text-[var(--olive)] transition-colors">
            REQUEST_MENTOR
          </h3>
          <p className="text-[10px] text-[var(--cream)]/40 font-mono uppercase mt-2">
            Get matched with an expert in a specific area
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase text-[var(--olive)]">
            <span className="material-symbols-outlined text-sm">add</span>
            NEW_REQUEST
          </div>
        </button>

        <button className="p-8 border-r border-[var(--grid-line)] hover:bg-[#0a0a0a] transition-colors group text-left">
          <span className="material-symbols-outlined text-3xl text-amber-500 mb-4">lightbulb</span>
          <h3 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)] group-hover:text-[var(--olive)] transition-colors">
            SUGGEST_FEATURE
          </h3>
          <p className="text-[10px] text-[var(--cream)]/40 font-mono uppercase mt-2">
            Help us improve the platform for founders
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase text-[var(--olive)]">
            <span className="material-symbols-outlined text-sm">add</span>
            NEW_SUGGESTION
          </div>
        </button>

        <button className="p-8 hover:bg-[#0a0a0a] transition-colors group text-left">
          <span className="material-symbols-outlined text-3xl text-blue-500 mb-4">chat</span>
          <h3 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)] group-hover:text-[var(--olive)] transition-colors">
            GIVE_FEEDBACK
          </h3>
          <p className="text-[10px] text-[var(--cream)]/40 font-mono uppercase mt-2">
            Report issues or share your thoughts
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase text-[var(--olive)]">
            <span className="material-symbols-outlined text-sm">add</span>
            SEND_FEEDBACK
          </div>
        </button>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-4 border-b border-[var(--grid-line)]">
        <div className="p-6 border-r border-[var(--grid-line)]">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--olive)] mb-2">
            TOTAL_REQUESTS
          </p>
          <p className="text-3xl font-black font-mono text-[var(--cream)]">{mockRequests.length}</p>
        </div>
        <div className="p-6 border-r border-[var(--grid-line)]">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400 mb-2">
            IN_REVIEW
          </p>
          <p className="text-3xl font-black font-mono text-blue-400">
            {mockRequests.filter(r => r.status === 'in_review').length}
          </p>
        </div>
        <div className="p-6 border-r border-[var(--grid-line)]">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--olive)] mb-2">
            APPROVED
          </p>
          <p className="text-3xl font-black font-mono text-[var(--olive)]">
            {mockRequests.filter(r => r.status === 'approved' || r.status === 'completed').length}
          </p>
        </div>
        <div className="p-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--warning)] mb-2">
            DECLINED
          </p>
          <p className="text-3xl font-black font-mono text-[var(--warning)]">
            {mockRequests.filter(r => r.status === 'declined').length}
          </p>
        </div>
      </section>

      {/* Requests List */}
      <div className="flex-1 overflow-auto">
        {mockRequests.length > 0 ? (
          <div className="divide-y divide-[var(--grid-line)]">
            {mockRequests.map((request) => {
              const typeConfig = getRequestTypeConfig(request.requestType)
              const statusConfig = getStatusConfig(request.status)
              const priorityConfig = getPriorityConfig(request.priority)

              return (
                <div key={request.id} className="p-6 hover:bg-[#0a0a0a] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`size-12 border border-[var(--grid-line)] flex items-center justify-center ${priorityConfig.bgColor}`}>
                      <span className={`material-symbols-outlined text-xl ${typeConfig.color}`}>
                        {typeConfig.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold font-mono text-[var(--cream)]">{request.title}</h3>
                          <p className="text-sm text-[var(--cream)]/60 mt-1">{request.description}</p>
                        </div>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${statusConfig.borderClass} ${statusConfig.textClass}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-[var(--cream)]/20 text-[var(--cream)]/60">
                          {typeConfig.label}
                        </span>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border border-[var(--cream)]/20 ${priorityConfig.color}`}>
                          {priorityConfig.label}_PRIORITY
                        </span>
                        <span className="text-[10px] font-mono text-[var(--cream)]/40">
                          {new Date(request.createdAt).toLocaleDateString().toUpperCase()}
                        </span>
                      </div>
                      {request.responseNotes && (
                        <div className="mt-4 p-4 border border-[var(--olive)]/30 bg-[var(--olive)]/5">
                          <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2">RESPONSE</p>
                          <p className="text-sm text-[var(--cream)]/80">{request.responseNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="material-symbols-outlined text-5xl text-[var(--cream)]/20 mb-4">inbox</span>
            <p className="text-[var(--cream)]/40 font-mono uppercase text-sm">NO_REQUESTS_YET</p>
            <p className="text-[10px] text-[var(--cream)]/20 font-mono uppercase mt-2">
              Use the options above to submit your first request
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
