'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Toaster } from '@/components/ui/sonner'
import { CheckCircle2, Circle, Clock, MessageSquare, Save, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
interface Checkpoint {
  id: string
  name: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  dueDate: string
  completedAt: string | null
  notes: string | null
}

interface Feedback {
  id: string
  message: string
  type: string
  date: string
  from: string
  checkpointId: string | null
}

interface ProgressData {
  completed: number
  total: number
  percent: number
}

export default function ProgressPage() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [progress, setProgress] = useState<ProgressData>({ completed: 0, total: 0, percent: 0 })
  const [stage, setStage] = useState<string>('')
  const [programmeStart, setProgrammeStart] = useState<string | null>(null)
  const [programmeEnd, setProgrammeEnd] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/founder/progress')
      const data = await res.json()
      if (data.checkpoints) {
        setCheckpoints(data.checkpoints)
        setFeedback(data.feedback || [])
        setProgress(data.progress || { completed: 0, total: 0, percent: 0 })
        setStage(data.stage || '')
        setProgrammeStart(data.programmeStart)
        setProgrammeEnd(data.programmeEnd)
        setIsMock(data.isMock)
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
      toast.error('Failed to load progress data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotes = async (checkpointId: string) => {
    setIsSavingNotes(true)
    try {
      const res = await fetch('/api/founder/progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkpointId, notes: notesValue }),
      })

      if (res.ok) {
        toast.success('Notes saved')
        setCheckpoints(checkpoints.map(cp =>
          cp.id === checkpointId ? { ...cp, notes: notesValue } : cp
        ))
        setEditingNotes(null)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save notes')
      }
    } catch (error) {
      toast.error('Failed to save notes')
    } finally {
      setIsSavingNotes(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getWeekNumber = () => {
    if (!programmeStart) return null
    const start = new Date(programmeStart)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - start.getTime())
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
    return diffWeeks
  }

  const getTotalWeeks = () => {
    if (!programmeStart || !programmeEnd) return null
    const start = new Date(programmeStart)
    const end = new Date(programmeEnd)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-3 w-64" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const weekNum = getWeekNumber()
  const totalWeeks = getTotalWeeks()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Progress</h1>
        <p className="text-muted-foreground mt-1">
          Track your programme milestones
          {isMock && <Badge variant="outline" className="ml-2 text-xs">Demo Mode</Badge>}
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Programme Progress</span>
            <span className="text-sm text-muted-foreground">{progress.completed} of {progress.total} checkpoints</span>
          </div>
          <Progress value={progress.percent} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {weekNum && totalWeeks ? (
              <>You&apos;re in Week {weekNum} of {totalWeeks}</>
            ) : null}
            {stage && <> • {stage.replace(/_/g, ' ')} phase</>}
          </p>
        </CardContent>
      </Card>

      {/* Checkpoints Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Checkpoints</CardTitle>
          <CardDescription>Your milestone timeline</CardDescription>
        </CardHeader>
        <CardContent>
          {checkpoints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No checkpoints assigned yet</p>
              <p className="text-sm mt-1">Your programme checkpoints will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {checkpoints.map((checkpoint, index) => (
                <div key={checkpoint.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {checkpoint.status === 'completed' ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : checkpoint.status === 'in_progress' ? (
                      <Clock className="h-6 w-6 text-blue-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                    {index < checkpoints.length - 1 && (
                      <div className={`w-0.5 flex-1 mt-2 ${checkpoint.status === 'completed' ? 'bg-green-500' : 'bg-muted'}`} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{checkpoint.name}</p>
                      <Badge
                        variant={
                          checkpoint.status === 'completed' ? 'default' :
                          checkpoint.status === 'in_progress' ? 'secondary' : 'outline'
                        }
                      >
                        {checkpoint.status === 'completed' ? 'Completed' :
                         checkpoint.status === 'in_progress' ? 'In Progress' : 'Upcoming'}
                      </Badge>
                    </div>
                    {checkpoint.description && (
                      <p className="text-sm text-muted-foreground mt-1">{checkpoint.description}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {checkpoint.status === 'completed'
                        ? `Completed on ${formatDate(checkpoint.completedAt!)}`
                        : `Due ${formatDate(checkpoint.dueDate)}`}
                    </p>

                    {/* Notes Section */}
                    {editingNotes === checkpoint.id ? (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          placeholder="Add your notes..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveNotes(checkpoint.id)}
                            disabled={isSavingNotes}
                          >
                            {isSavingNotes ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-1" />
                            )}
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingNotes(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : checkpoint.notes ? (
                      <div
                        className="mt-2 p-3 bg-muted/50 rounded-lg text-sm cursor-pointer hover:bg-muted"
                        onClick={() => {
                          if (!isMock) {
                            setEditingNotes(checkpoint.id)
                            setNotesValue(checkpoint.notes || '')
                          }
                        }}
                      >
                        {checkpoint.notes}
                      </div>
                    ) : !isMock && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-muted-foreground"
                        onClick={() => {
                          setEditingNotes(checkpoint.id)
                          setNotesValue('')
                        }}
                      >
                        + Add notes
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partner Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Partner Feedback
          </CardTitle>
          <CardDescription>Notes and feedback from your partners</CardDescription>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No feedback yet</p>
              <p className="text-sm mt-1">Partner feedback will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((fb) => (
                <div key={fb.id} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{fb.from}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(fb.date)}</span>
                  </div>
                  <p className="text-sm">{fb.message}</p>
                  {fb.type && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {fb.type}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}
