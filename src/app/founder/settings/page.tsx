'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { FounderHeader } from '@/components/founder/layout/founder-header'
import { useState } from 'react'

export default function FounderSettingsPage() {
  const { data: session, status } = useSession()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [checkpointReminders, setCheckpointReminders] = useState(true)
  const [partnerMessages, setPartnerMessages] = useState(true)
  const [shareMetrics, setShareMetrics] = useState(true)
  const [shareDocuments, setShareDocuments] = useState(false)
  const [benchmarkParticipation, setBenchmarkParticipation] = useState(true)

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

  return (
    <div className="flex flex-col h-full bg-[var(--deep-black)]">
      <FounderHeader
        title="CONFIGURATION"
        breadcrumb={['Settings']}
      />

      <div className="flex-1 overflow-auto p-10 max-w-3xl">
        {/* Profile */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-xl text-blue-500">person</span>
            <h2 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)]">
              PROFILE
            </h2>
          </div>
          <div className="border border-[var(--grid-line)] p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                  FULL_NAME
                </label>
                <input
                  type="text"
                  defaultValue={session.user.name || ''}
                  className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                  EMAIL
                </label>
                <input
                  type="email"
                  defaultValue={session.user.email || ''}
                  disabled
                  className="w-full bg-[var(--grid-line)]/20 border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)]/40 font-mono text-sm cursor-not-allowed"
                />
                <p className="text-[10px] text-[var(--cream)]/40 font-mono mt-1">EMAIL_CANNOT_BE_CHANGED</p>
              </div>
            </div>
            <button className="bg-[var(--olive)] text-[var(--deep-black)] px-6 py-3 text-xs font-bold tracking-widest font-mono uppercase hover:bg-[var(--cream)] transition-colors">
              SAVE_CHANGES
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-xl text-amber-500">notifications</span>
            <h2 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)]">
              NOTIFICATIONS
            </h2>
          </div>
          <div className="border border-[var(--grid-line)] divide-y divide-[var(--grid-line)]">
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="font-mono text-sm text-[var(--cream)]">EMAIL_NOTIFICATIONS</p>
                <p className="text-[10px] text-[var(--cream)]/60 font-mono uppercase mt-1">
                  Receive updates about your startup via email
                </p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-12 h-6 border transition-colors ${
                  emailNotifications ? 'bg-[var(--olive)] border-[var(--olive)]' : 'bg-transparent border-[var(--grid-line)]'
                }`}
              >
                <div className={`size-4 transition-transform ${
                  emailNotifications ? 'translate-x-6 bg-[var(--deep-black)]' : 'translate-x-1 bg-[var(--cream)]/40'
                }`} />
              </button>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="font-mono text-sm text-[var(--cream)]">CHECKPOINT_REMINDERS</p>
                <p className="text-[10px] text-[var(--cream)]/60 font-mono uppercase mt-1">
                  Get reminded about upcoming checkpoints
                </p>
              </div>
              <button
                onClick={() => setCheckpointReminders(!checkpointReminders)}
                className={`w-12 h-6 border transition-colors ${
                  checkpointReminders ? 'bg-[var(--olive)] border-[var(--olive)]' : 'bg-transparent border-[var(--grid-line)]'
                }`}
              >
                <div className={`size-4 transition-transform ${
                  checkpointReminders ? 'translate-x-6 bg-[var(--deep-black)]' : 'translate-x-1 bg-[var(--cream)]/40'
                }`} />
              </button>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="font-mono text-sm text-[var(--cream)]">PARTNER_MESSAGES</p>
                <p className="text-[10px] text-[var(--cream)]/60 font-mono uppercase mt-1">
                  Notifications when partners share insights
                </p>
              </div>
              <button
                onClick={() => setPartnerMessages(!partnerMessages)}
                className={`w-12 h-6 border transition-colors ${
                  partnerMessages ? 'bg-[var(--olive)] border-[var(--olive)]' : 'bg-transparent border-[var(--grid-line)]'
                }`}
              >
                <div className={`size-4 transition-transform ${
                  partnerMessages ? 'translate-x-6 bg-[var(--deep-black)]' : 'translate-x-1 bg-[var(--cream)]/40'
                }`} />
              </button>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-xl text-[var(--olive)]">shield</span>
            <h2 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)]">
              PRIVACY_&_DATA_SHARING
            </h2>
          </div>
          <div className="border border-[var(--grid-line)] divide-y divide-[var(--grid-line)]">
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="font-mono text-sm text-[var(--cream)]">SHARE_METRICS_WITH_PARTNERS</p>
                <p className="text-[10px] text-[var(--cream)]/60 font-mono uppercase mt-1">
                  Allow partners to view your startup metrics
                </p>
              </div>
              <button
                onClick={() => setShareMetrics(!shareMetrics)}
                className={`w-12 h-6 border transition-colors ${
                  shareMetrics ? 'bg-[var(--olive)] border-[var(--olive)]' : 'bg-transparent border-[var(--grid-line)]'
                }`}
              >
                <div className={`size-4 transition-transform ${
                  shareMetrics ? 'translate-x-6 bg-[var(--deep-black)]' : 'translate-x-1 bg-[var(--cream)]/40'
                }`} />
              </button>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="font-mono text-sm text-[var(--cream)]">SHARE_DOCUMENTS_BY_DEFAULT</p>
                <p className="text-[10px] text-[var(--cream)]/60 font-mono uppercase mt-1">
                  New documents are automatically shared with partners
                </p>
              </div>
              <button
                onClick={() => setShareDocuments(!shareDocuments)}
                className={`w-12 h-6 border transition-colors ${
                  shareDocuments ? 'bg-[var(--olive)] border-[var(--olive)]' : 'bg-transparent border-[var(--grid-line)]'
                }`}
              >
                <div className={`size-4 transition-transform ${
                  shareDocuments ? 'translate-x-6 bg-[var(--deep-black)]' : 'translate-x-1 bg-[var(--cream)]/40'
                }`} />
              </button>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="font-mono text-sm text-[var(--cream)]">BENCHMARK_PARTICIPATION</p>
                <p className="text-[10px] text-[var(--cream)]/60 font-mono uppercase mt-1">
                  Include your data in anonymized cohort benchmarks
                </p>
              </div>
              <button
                onClick={() => setBenchmarkParticipation(!benchmarkParticipation)}
                className={`w-12 h-6 border transition-colors ${
                  benchmarkParticipation ? 'bg-[var(--olive)] border-[var(--olive)]' : 'bg-transparent border-[var(--grid-line)]'
                }`}
              >
                <div className={`size-4 transition-transform ${
                  benchmarkParticipation ? 'translate-x-6 bg-[var(--deep-black)]' : 'translate-x-1 bg-[var(--cream)]/40'
                }`} />
              </button>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-xl text-purple-500">mail</span>
            <h2 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)]">
              NEED_HELP?
            </h2>
          </div>
          <div className="border border-[var(--grid-line)] p-6">
            <p className="text-sm text-[var(--cream)]/60 mb-4">
              If you have questions or need support, reach out to the Sanctuary team.
            </p>
            <button className="border border-[var(--cream)]/20 text-[var(--cream)] px-6 py-3 text-xs font-bold tracking-widest font-mono uppercase hover:border-[var(--olive)] hover:text-[var(--olive)] transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">mail</span>
              CONTACT_SUPPORT
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
