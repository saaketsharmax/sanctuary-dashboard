'use client'

import { Button } from '@sanctuary/ui'
import { Calendar, Clock, CheckSquare, Sparkles, X } from 'lucide-react'
interface MyDayPanelProps {
  isOpen: boolean
  onClose: () => void
}

const todaysMeetings = [
  { id: '1', title: 'Weekly Sync with Sanctuary', time: '10:00 AM' },
  { id: '2', title: 'User Interview #12', time: '2:00 PM' },
  { id: '3', title: 'Team Standup', time: '4:30 PM' },
]

const todaysTasks = [
  { id: '1', title: 'Review pitch deck feedback', completed: false },
  { id: '2', title: 'Update financial model', completed: false },
  { id: '3', title: 'Send user research summary', completed: true },
  { id: '4', title: 'Prepare for investor call', completed: false },
]

export function MyDayPanel({ isOpen, onClose }: MyDayPanelProps) {
  if (!isOpen) return null

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/5 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-[400px] bg-card border-l border-border z-50 animate-in slide-in-from-right duration-300">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-8 pb-6 border-b border-border/30">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">{greeting}, Sarah</h2>
                <p className="text-sm text-muted-foreground">{today}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="transition-opacity hover:opacity-70"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-8 pt-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center py-3 border-l-2 border-border pl-3">
                <p className="text-xs text-muted-foreground mb-1">Meetings</p>
                <p className="text-2xl font-bold text-foreground">{todaysMeetings.length}</p>
              </div>
              <div className="text-center py-3 border-l-2 border-border pl-3">
                <p className="text-xs text-muted-foreground mb-1">Tasks Left</p>
                <p className="text-2xl font-bold text-foreground">
                  {todaysTasks.filter(t => !t.completed).length}
                </p>
              </div>
              <div className="text-center py-3 border-l-2 border-border pl-3">
                <p className="text-xs text-muted-foreground mb-1">Score</p>
                <p className="text-2xl font-bold text-foreground">78</p>
              </div>
            </div>

            {/* Today's Schedule */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Schedule</h3>
              <div className="space-y-3">
                {todaysMeetings.map((meeting, index) => (
                  <div
                    key={meeting.id}
                    className={`flex items-center gap-4 py-4 cursor-pointer group ${index !== todaysMeetings.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <div className="flex items-center justify-center w-14 h-14 bg-muted rounded-lg flex-shrink-0">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground font-medium">
                          {meeting.time.split(' ')[1]}
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {meeting.time.split(':')[0]}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                        {meeting.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{meeting.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Tasks */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Tasks</h3>
              <div className="space-y-3">
                {todaysTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 py-3 cursor-pointer group ${index !== todaysTasks.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        task.completed
                          ? 'bg-success border-success'
                          : 'border-muted-foreground/30 group-hover:border-primary'
                      }`}
                    >
                      {task.completed && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <p className={`text-sm flex-1 ${
                      task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                    } transition-colors`}>
                      {task.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">AI Insights</h3>
              <div className="space-y-4">
                <div className="py-4 border-l-2 border-success pl-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground mb-1">
                        MRR grew 12% this week
                      </p>
                      <p className="text-xs text-muted-foreground leading-[1.6]">
                        Keep the momentum going! You're on track.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-4 border-l-2 border-warning pl-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-warning" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Checkpoint review coming up
                      </p>
                      <p className="text-xs text-muted-foreground leading-[1.6]">
                        Feb 15 • Prepare your progress update
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
