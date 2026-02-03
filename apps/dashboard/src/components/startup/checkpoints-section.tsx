'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  Plus,
  ChevronDown,
  ChevronRight,
  FileText,
  MessageSquare,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { Checkpoint } from '@/types'
import { format } from 'date-fns'

interface CheckpointsSectionProps {
  checkpoints: Checkpoint[]
  startupName: string
  onAddCheckpoint?: () => void
  onEditCheckpoint?: (checkpoint: Checkpoint) => void
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    label: 'Completed',
  },
  in_progress: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    label: 'In Progress',
  },
  blocked: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    label: 'Blocked',
  },
  pending: {
    icon: Circle,
    color: 'text-gray-400',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    label: 'Pending',
  },
}

interface CheckpointCardProps {
  checkpoint: Checkpoint
}

function CheckpointCard({ checkpoint }: CheckpointCardProps) {
  const [isOpen, setIsOpen] = useState(checkpoint.status === 'in_progress')
  const config = statusConfig[checkpoint.status]
  const StatusIcon = config.icon

  const completedTasks = checkpoint.tasks.filter((t) => t.completed).length
  const totalTasks = checkpoint.tasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn('border-l-4', config.borderColor)}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-full', config.bgColor)}>
                  <StatusIcon className={cn('h-4 w-4', config.color)} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">Week {checkpoint.weekNumber}</CardTitle>
                    <Badge variant="outline" className={cn('text-xs', config.color)}>
                      {config.label}
                    </Badge>
                  </div>
                  {checkpoint.goal && (
                    <p className="text-sm text-muted-foreground mt-0.5">{checkpoint.goal}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {totalTasks > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {completedTasks}/{totalTasks} tasks
                  </div>
                )}
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Checkpoint Question */}
            {checkpoint.checkpointQuestion && (
              <div className="p-3 bg-accent/50 rounded-lg">
                <p className="text-sm font-medium">Key Question</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {checkpoint.checkpointQuestion}
                </p>
              </div>
            )}

            {/* Tasks */}
            {checkpoint.tasks.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Tasks</p>
                <div className="space-y-2">
                  {checkpoint.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
                <Progress value={progress} className="h-1.5 mt-3" />
              </div>
            )}

            {/* Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checkpoint.founderNotes && (
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <MessageSquare className="h-4 w-4" />
                    Founder Notes
                  </div>
                  <p className="text-sm text-muted-foreground">{checkpoint.founderNotes}</p>
                </div>
              )}
              {checkpoint.partnerNotes && (
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <MessageSquare className="h-4 w-4" />
                    Partner Feedback
                  </div>
                  <p className="text-sm text-muted-foreground">{checkpoint.partnerNotes}</p>
                </div>
              )}
            </div>

            {/* Evidence */}
            {checkpoint.evidenceUrls.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Evidence</p>
                <div className="flex flex-wrap gap-2">
                  {checkpoint.evidenceUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Link {i + 1}
                      </Button>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Completion date */}
            {checkpoint.completedAt && (
              <p className="text-xs text-muted-foreground">
                Completed on {format(new Date(checkpoint.completedAt), 'MMM d, yyyy')}
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export function CheckpointsSection({ checkpoints, startupName, onAddCheckpoint, onEditCheckpoint }: CheckpointsSectionProps) {
  const completedCount = checkpoints.filter((c) => c.status === 'completed').length
  const totalWeeks = 20
  const progress = (completedCount / totalWeeks) * 100

  // Sort checkpoints by week number
  const sortedCheckpoints = [...checkpoints].sort((a, b) => a.weekNumber - b.weekNumber)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Programme Progress</h2>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {totalWeeks} weeks completed
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={onAddCheckpoint}>
          <Plus className="h-4 w-4" />
          Add Checkpoint
        </Button>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">20-Week Programme</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Problem Discovery</span>
            <span>Solution</span>
            <span>User Value</span>
            <span>Growth</span>
            <span>Capital</span>
          </div>
        </CardContent>
      </Card>

      {/* Checkpoints List */}
      <div className="space-y-3">
        {sortedCheckpoints.map((checkpoint) => (
          <CheckpointCard key={checkpoint.id} checkpoint={checkpoint} />
        ))}
      </div>

      {checkpoints.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No checkpoints recorded yet</p>
            <Button variant="outline" className="mt-4">
              Add First Checkpoint
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
