import { auth } from '@/lib/auth/auth-config'
import { redirect } from 'next/navigation'
import { FounderHeader } from '@/components/founder/layout/founder-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  MessageSquare,
} from 'lucide-react'
import { getCheckpointsByStartupId, getStartupById } from '@/lib/mock-data'
import { getStageInfo } from '@/types'

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />
    case 'in_progress':
      return <Clock className="h-5 w-5 text-blue-600" />
    case 'blocked':
      return <AlertCircle className="h-5 w-5 text-red-600" />
    default:
      return <Circle className="h-5 w-5 text-gray-400" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-600">Completed</Badge>
    case 'in_progress':
      return <Badge variant="outline" className="border-blue-500 text-blue-600">In Progress</Badge>
    case 'blocked':
      return <Badge variant="destructive">Blocked</Badge>
    default:
      return <Badge variant="secondary">Pending</Badge>
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
    <div className="flex flex-col">
      <FounderHeader
        title="Progress"
        description="Track your checkpoints and milestones"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Programme Progress</CardTitle>
                <CardDescription>
                  Current Stage: {stageInfo.label}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {completedCount} / {checkpoints.length} Completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Checkpoints Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Checkpoints</CardTitle>
            <CardDescription>Your weekly goals and tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {checkpoints.length > 0 ? (
                checkpoints.map((checkpoint, index) => (
                  <div key={checkpoint.id}>
                    <div className="flex gap-4">
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center">
                        {getStatusIcon(checkpoint.status)}
                        {index < checkpoints.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-2" />
                        )}
                      </div>

                      {/* Checkpoint content */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">Week {checkpoint.weekNumber}</h3>
                              {getStatusBadge(checkpoint.status)}
                            </div>
                            <p className="text-muted-foreground mt-1">{checkpoint.goal}</p>
                          </div>
                          {checkpoint.completedAt && (
                            <span className="text-xs text-muted-foreground">
                              Completed {new Date(checkpoint.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {checkpoint.checkpointQuestion && (
                          <div className="mt-3 rounded-lg bg-muted p-3">
                            <p className="text-sm font-medium">Key Question:</p>
                            <p className="text-sm text-muted-foreground">
                              {checkpoint.checkpointQuestion}
                            </p>
                          </div>
                        )}

                        {checkpoint.tasks.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium">Tasks:</p>
                            {checkpoint.tasks.map((task) => (
                              <div key={task.id} className="flex items-center gap-2">
                                <Checkbox checked={task.completed} disabled />
                                <span
                                  className={
                                    task.completed ? 'text-sm line-through text-muted-foreground' : 'text-sm'
                                  }
                                >
                                  {task.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {(checkpoint.founderNotes || checkpoint.partnerNotes) && (
                          <div className="mt-4 space-y-3">
                            {checkpoint.founderNotes && (
                              <div className="rounded-lg border p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <MessageSquare className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-medium">Your Notes</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {checkpoint.founderNotes}
                                </p>
                              </div>
                            )}
                            {checkpoint.partnerNotes && (
                              <div className="rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <MessageSquare className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium">Partner Feedback</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {checkpoint.partnerNotes}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {checkpoint.evidenceUrls.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-1">Evidence:</p>
                            <div className="flex flex-wrap gap-2">
                              {checkpoint.evidenceUrls.map((url, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {url}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {index < checkpoints.length - 1 && <Separator className="mt-2" />}
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No checkpoints yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Checkpoints will appear here once your programme begins
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
