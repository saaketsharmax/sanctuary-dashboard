import { auth } from '@/lib/auth/auth-config'
import { redirect } from 'next/navigation'
import { FounderHeader } from '@/components/founder/layout/founder-header'
import Link from 'next/link'
import { getStartupWithFounders } from '@/lib/mock-data'
import { getStageInfo } from '@/types'

export default async function FounderCompanyPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const startupId = session.user.startupId

  if (!startupId) {
    redirect('/founder/dashboard')
  }

  const startup = getStartupWithFounders(startupId)

  if (!startup) {
    redirect('/founder/dashboard')
  }

  const stageInfo = getStageInfo(startup.stage)

  return (
    <div className="flex flex-col h-full bg-[var(--deep-black)]">
      <FounderHeader
        title="COMPANY_PROFILE"
        breadcrumb={['Company']}
        description={startup.name}
      />

      {/* Company Overview */}
      <section className="border-b border-[var(--grid-line)] p-10">
        <div className="flex items-start gap-6">
          {startup.logoUrl ? (
            <div
              className="size-24 border border-[var(--grid-line)] bg-cover bg-center"
              style={{ backgroundImage: `url("${startup.logoUrl}")` }}
            />
          ) : (
            <div className="size-24 border border-[var(--grid-line)] flex items-center justify-center">
              <span className="text-4xl font-bold font-mono text-[var(--olive)]">
                {startup.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold font-mono uppercase tracking-tight text-[var(--cream)]">
                {startup.name.replace(/ /g, '_').toUpperCase()}
              </h2>
              <span className="text-[10px] font-mono uppercase px-3 py-1 border border-[var(--olive)] text-[var(--olive)]">
                {stageInfo.label.toUpperCase()}_STAGE
              </span>
            </div>
            <p className="text-sm text-[var(--cream)]/60 mt-2 max-w-2xl">{startup.oneLiner}</p>
            <div className="mt-4 flex flex-wrap gap-6 text-[10px] font-mono uppercase text-[var(--cream)]/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[var(--olive)]">location_on</span>
                {startup.city}, {startup.country}
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[var(--olive)]">category</span>
                {startup.industry}
              </div>
              {startup.website && (
                <Link
                  href={startup.website}
                  target="_blank"
                  className="flex items-center gap-2 hover:text-[var(--olive)] transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-[var(--olive)]">language</span>
                  WEBSITE
                  <span className="material-symbols-outlined text-xs">arrow_outward</span>
                </Link>
              )}
            </div>
          </div>
        </div>
        {startup.description && (
          <div className="mt-6 p-4 border border-[var(--grid-line)]">
            <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2">DESCRIPTION</p>
            <p className="text-sm text-[var(--cream)]/80">{startup.description}</p>
          </div>
        )}
      </section>

      <div className="flex-1 overflow-auto">
        {/* Problem & Solution */}
        <section className="grid md:grid-cols-2 border-b border-[var(--grid-line)]">
          <div className="p-8 border-r border-[var(--grid-line)]">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-2xl text-[var(--warning)]">target</span>
              <h3 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)]">
                PROBLEM
              </h3>
            </div>
            <p className="text-sm text-[var(--cream)]/80 mb-6">
              {startup.problemStatement || 'No problem statement defined yet.'}
            </p>
            {startup.targetCustomer && (
              <div className="p-4 border border-[var(--grid-line)]">
                <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2">TARGET_CUSTOMER</p>
                <p className="text-sm text-[var(--cream)]/80">{startup.targetCustomer}</p>
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-2xl text-[var(--olive)]">lightbulb</span>
              <h3 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)]">
                SOLUTION
              </h3>
            </div>
            <p className="text-sm text-[var(--cream)]/80 mb-6">
              {startup.solutionDescription || 'No solution description defined yet.'}
            </p>
            <div className="p-4 border border-[var(--grid-line)]">
              <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2">BUSINESS_MODEL</p>
              <span className="text-[10px] font-mono uppercase px-2 py-1 border border-[var(--cream)]/20 text-[var(--cream)]/60">
                {startup.businessModel.toUpperCase()}
              </span>
            </div>
          </div>
        </section>

        {/* Programme Status */}
        <section className="border-b border-[var(--grid-line)] p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-2xl text-blue-500">calendar_month</span>
            <h3 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)]">
              PROGRAMME_STATUS
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-[var(--grid-line)]">
            <div className="bg-[var(--deep-black)] p-6">
              <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2">STATUS</p>
              <span className={`text-[10px] font-mono uppercase px-2 py-1 ${
                startup.status === 'active'
                  ? 'bg-[var(--olive)] text-[var(--deep-black)]'
                  : 'border border-[var(--cream)]/20 text-[var(--cream)]/60'
              }`}>
                {startup.status.toUpperCase()}
              </span>
            </div>
            {startup.residencyStart && (
              <div className="bg-[var(--deep-black)] p-6">
                <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2">RESIDENCY_START</p>
                <p className="text-lg font-mono text-[var(--cream)]">
                  {new Date(startup.residencyStart).toLocaleDateString().toUpperCase()}
                </p>
              </div>
            )}
            {startup.residencyEnd && (
              <div className="bg-[var(--deep-black)] p-6">
                <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2">RESIDENCY_END</p>
                <p className="text-lg font-mono text-[var(--cream)]">
                  {new Date(startup.residencyEnd).toLocaleDateString().toUpperCase()}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Founding Team */}
        <section className="border-b border-[var(--grid-line)] p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-[var(--olive)]">group</span>
              <h3 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)]">
                FOUNDING_TEAM
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-1 border border-[var(--cream)]/20 text-[var(--cream)]/60">
              {startup.founders.length}_MEMBERS
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-[var(--grid-line)]">
            {startup.founders.map((founder) => (
              <div key={founder.id} className="bg-[var(--deep-black)] p-6 flex items-start gap-4">
                <div className="size-14 border border-[var(--grid-line)] flex items-center justify-center">
                  {founder.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={founder.photoUrl}
                      alt={founder.name}
                      className="size-14 object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold font-mono text-[var(--olive)]">
                      {founder.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold font-mono uppercase text-[var(--cream)]">{founder.name}</p>
                    {founder.isLead && (
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-[var(--olive)] text-[var(--deep-black)]">
                        LEAD
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono uppercase text-[var(--cream)]/60 mt-1">{founder.role}</p>
                  <p className="text-[10px] text-[var(--cream)]/40 mt-1">{founder.email}</p>
                  {founder.linkedin && (
                    <Link
                      href={founder.linkedin}
                      target="_blank"
                      className="text-[10px] font-mono uppercase text-[var(--olive)] hover:text-[var(--cream)] transition-colors mt-2 inline-flex items-center gap-1"
                    >
                      LINKEDIN
                      <span className="material-symbols-outlined text-xs">arrow_outward</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Evaluation Scores */}
        {startup.overallScore !== null && (
          <section className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-2xl text-purple-500">analytics</span>
              <h3 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)]">
                EVALUATION_SCORES
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-1 border border-[var(--cream)]/20 text-[var(--cream)]/40">
                READ_ONLY
              </span>
            </div>
            <div className="grid grid-cols-5 gap-px bg-[var(--grid-line)]">
              <div className="bg-[var(--deep-black)] p-6 text-center">
                <p className="text-4xl font-black font-mono text-blue-500">
                  {startup.founderScore ?? '--'}
                </p>
                <p className="text-[10px] font-mono uppercase text-[var(--cream)]/60 mt-2">FOUNDER</p>
              </div>
              <div className="bg-[var(--deep-black)] p-6 text-center">
                <p className="text-4xl font-black font-mono text-purple-500">
                  {startup.problemScore ?? '--'}
                </p>
                <p className="text-[10px] font-mono uppercase text-[var(--cream)]/60 mt-2">PROBLEM</p>
              </div>
              <div className="bg-[var(--deep-black)] p-6 text-center">
                <p className="text-4xl font-black font-mono text-[var(--olive)]">
                  {startup.userValueScore ?? '--'}
                </p>
                <p className="text-[10px] font-mono uppercase text-[var(--cream)]/60 mt-2">USER_VALUE</p>
              </div>
              <div className="bg-[var(--deep-black)] p-6 text-center">
                <p className="text-4xl font-black font-mono text-amber-500">
                  {startup.executionScore ?? '--'}
                </p>
                <p className="text-[10px] font-mono uppercase text-[var(--cream)]/60 mt-2">EXECUTION</p>
              </div>
              <div className="bg-[var(--deep-black)] p-6 text-center border-l-2 border-[var(--olive)]">
                <p className="text-4xl font-black font-mono text-[var(--cream)]">
                  {startup.overallScore ?? '--'}
                </p>
                <p className="text-[10px] font-mono uppercase text-[var(--olive)] mt-2">OVERALL</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
