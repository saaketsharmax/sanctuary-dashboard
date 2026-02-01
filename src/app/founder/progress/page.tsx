import { auth } from '@/lib/auth/auth-config'
import { redirect } from 'next/navigation'
import { FounderHeader } from '@/components/founder/layout/founder-header'
import { getCheckpointsByStartupId, getStartupById } from '@/lib/mock-data'
import { getStageInfo } from '@/types'

function getStatusStyle(status: string) {
  switch (status) {
    case 'completed':
      return { icon: 'check_circle', color: 'text-[var(--olive)]', bgColor: 'bg-[var(--olive)]', label: 'COMPLETED' }
    case 'in_progress':
      return { icon: 'pending', color: 'text-blue-500', bgColor: 'bg-blue-500', label: 'IN_PROGRESS' }
    case 'blocked':
      return { icon: 'error', color: 'text-[var(--warning)]', bgColor: 'bg-[var(--warning)]', label: 'BLOCKED' }
    default:
      return { icon: 'radio_button_unchecked', color: 'text-[var(--cream)]/40', bgColor: 'bg-[var(--cream)]/40', label: 'PENDING' }
  }
}

export default async function FounderProgressPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const startupId = session.user.startupId

  if (!startupId) {
    redirect('/founder/dashboard')
  }

  const startup = getStartupById(startupId)
  const checkpoints = getCheckpointsByStartupId(startupId)

  if (!startup) {
    redirect('/founder/dashboard')
  }

  const stageInfo = getStageInfo(startup.stage)
  const completedCount = checkpoints.filter((c) => c.status === 'completed').length
  const progressPercent = checkpoints.length > 0 ? (completedCount / checkpoints.length) * 100 : 0

  return (
    <div className="flex flex-col h-full bg-[var(--deep-black)]">
      <FounderHeader
        title="MISSION_CONTROL"
        breadcrumb={['Progress']}
        description={stageInfo.label}
      />

      {/* Progress Overview */}
      <section className="border-b border-[var(--grid-line)] p-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight text-[var(--cream)]">
              PROGRAMME_PROGRESS
            </h2>
            <p className="text-[10px] font-mono uppercase text-[var(--cream)]/60 mt-1">
              CURRENT_STAGE: {stageInfo.label.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black font-mono text-[var(--cream)]">
              {completedCount}<span className="text-[var(--cream)]/40">/{checkpoints.length}</span>
            </p>
            <p className="text-[10px] font-mono uppercase text-[var(--olive)] mt-1">CHECKPOINTS_COMPLETED</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono uppercase text-[var(--cream)]/60">
            <span>OVERALL_PROGRESS</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 bg-[var(--grid-line)]">
            <div
              className="h-full bg-[var(--olive)] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Checkpoints Timeline */}
      <div className="flex-1 overflow-auto p-10">
        {checkpoints.length > 0 ? (
          <div className="space-y-px bg-[var(--grid-line)]">
            {checkpoints.map((checkpoint, index) => {
              const statusStyle = getStatusStyle(checkpoint.status)

              return (
                <div key={checkpoint.id} className="bg-[var(--deep-black)] p-6">
                  <div className="flex gap-6">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`size-10 border flex items-center justify-center ${
                        checkpoint.status === 'completed' ? 'border-[var(--olive)] bg-[var(--olive)]/10' :
                        checkpoint.status === 'in_progress' ? 'border-blue-500 bg-blue-500/10' :
                        checkpoint.status === 'blocked' ? 'border-[var(--warning)] bg-[var(--warning)]/10' :
                        'border-[var(--grid-line)]'
                      }`}>
                        <span className={`material-symbols-outlined text-xl ${statusStyle.color}`}>
                          {statusStyle.icon}
                        </span>
                      </div>
                      {index < checkpoints.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-2 min-h-[40px] ${
                          checkpoint.status === 'completed' ? 'bg-[var(--olive)]' : 'bg-[var(--grid-line)]'
                        }`} />
                      )}
                    </div>

                    {/* Checkpoint content */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[var(--olive)] text-[var(--deep-black)]">
                              WEEK_{checkpoint.weekNumber}
                            </span>
                            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                              checkpoint.status === 'completed' ? 'border-[var(--olive)] text-[var(--olive)]' :
                              checkpoint.status === 'in_progress' ? 'border-blue-500 text-blue-500' :
                              checkpoint.status === 'blocked' ? 'border-[var(--warning)] text-[var(--warning)]' :
                              'border-[var(--cream)]/20 text-[var(--cream)]/40'
                            }`}>
                              {statusStyle.label}
                            </span>
                          </div>
                          <h3 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)] mt-3">
                            {checkpoint.goal || `CHECKPOINT_${checkpoint.weekNumber}`}
                          </h3>
                        </div>
                        {checkpoint.completedAt && (
                          <span className="text-[10px] font-mono text-[var(--cream)]/40">
                            COMPLETED: {new Date(checkpoint.completedAt).toLocaleDateString().toUpperCase()}
                          </span>
                        )}
                      </div>

                      {checkpoint.checkpointQuestion && (
                        <div className="mt-4 p-4 border border-[var(--grid-line)]">
                          <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2">KEY_QUESTION</p>
                          <p className="text-sm text-[var(--cream)]/80">{checkpoint.checkpointQuestion}</p>
                        </div>
                      )}

                      {checkpoint.tasks.length > 0 && (
                        <div className="mt-4">
                          <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-3">TASKS</p>
                          <div className="space-y-2">
                            {checkpoint.tasks.map((task) => (
                              <div key={task.id} className="flex items-center gap-3">
                                <div className={`size-5 border flex items-center justify-center ${
                                  task.completed ? 'border-[var(--olive)] bg-[var(--olive)]' : 'border-[var(--cream)]/20'
                                }`}>
                                  {task.completed && (
                                    <span className="material-symbols-outlined text-sm text-[var(--deep-black)]">check</span>
                                  )}
                                </div>
                                <span className={`text-sm font-mono ${
                                  task.completed ? 'text-[var(--cream)]/40 line-through' : 'text-[var(--cream)]/80'
                                }`}>
                                  {task.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(checkpoint.founderNotes || checkpoint.partnerNotes) && (
                        <div className="mt-4 grid md:grid-cols-2 gap-4">
                          {checkpoint.founderNotes && (
                            <div className="p-4 border border-[var(--grid-line)]">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-sm text-blue-500">edit_note</span>
                                <span className="text-[10px] font-mono uppercase text-[var(--cream)]/60">YOUR_NOTES</span>
                              </div>
                              <p className="text-sm text-[var(--cream)]/80">{checkpoint.founderNotes}</p>
                            </div>
                          )}
                          {checkpoint.partnerNotes && (
                            <div className="p-4 border border-[var(--olive)]/30 bg-[var(--olive)]/5">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-sm text-[var(--olive)]">rate_review</span>
                                <span className="text-[10px] font-mono uppercase text-[var(--olive)]">PARTNER_FEEDBACK</span>
                              </div>
                              <p className="text-sm text-[var(--cream)]/80">{checkpoint.partnerNotes}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {checkpoint.evidenceUrls.length > 0 && (
                        <div className="mt-4">
                          <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2">EVIDENCE</p>
                          <div className="flex flex-wrap gap-2">
                            {checkpoint.evidenceUrls.map((url, i) => (
                              <span key={i} className="text-[10px] font-mono px-2 py-1 border border-[var(--cream)]/20 text-[var(--cream)]/60">
                                {url}
                              </span>
                            ))}
                          </div>
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
            <span className="material-symbols-outlined text-5xl text-[var(--cream)]/20 mb-4">checklist</span>
            <p className="text-[var(--cream)]/40 font-mono uppercase text-sm">NO_CHECKPOINTS_YET</p>
            <p className="text-[10px] text-[var(--cream)]/20 font-mono uppercase mt-2">
              Checkpoints will appear here once your programme begins
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
