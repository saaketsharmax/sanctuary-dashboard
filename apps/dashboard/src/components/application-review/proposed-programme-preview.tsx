'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Target,
  Users,
  AlertCircle,
  Flag,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProposedProgramme, ProposedProgrammeWeek, Stage } from '@/types'
import { getStageInfo } from '@/types'

interface ProposedProgrammePreviewProps {
  programme: ProposedProgramme
  weeks: ProposedProgrammeWeek[]
}

interface WeekCardProps {
  week: ProposedProgrammeWeek
  defaultOpen?: boolean
}

function WeekCard({ week, defaultOpen = false }: WeekCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const stageInfo = week.focusArea === 'buffer' ? null : getStageInfo(week.focusArea as Stage)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-4 py-3 h-auto hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="font-medium">Week {week.weekNumber}</span>
            {week.title && <span className="text-muted-foreground">- {week.title}</span>}
            <div className="flex items-center gap-2">
              {week.isMilestone && (
                <Badge className="bg-purple-100 text-purple-700 text-xs">
                  <Flag className="h-3 w-3 mr-1" />
                  Milestone
                </Badge>
              )}
              {week.isCustomWeek && (
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Custom
                </Badge>
              )}
            </div>
          </div>
          {stageInfo && (
            <Badge variant="outline" className="text-xs">
              {stageInfo.label}
            </Badge>
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4 pt-2 space-y-4 ml-7">
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase">Goal</span>
            <p className="text-sm mt-1">{week.goal}</p>
          </div>

          {week.tasks.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase">Tasks</span>
              <ul className="mt-2 space-y-2">
                {week.tasks.map((task, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Checkbox disabled checked={false} className="mt-0.5" />
                    <span className={cn(!task.required && 'text-muted-foreground')}>
                      {task.task}
                      {!task.required && (
                        <span className="text-xs text-muted-foreground ml-1">(optional)</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {week.checkpointQuestion && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Checkpoint Question
              </span>
              <p className="text-sm mt-1 italic">"{week.checkpointQuestion}"</p>
            </div>
          )}

          {week.metricsToTrack.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Metrics to Track
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {week.metricsToTrack.map((metric, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {metric.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {week.mentorFocus && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Mentor focus: {week.mentorFocus}</span>
            </div>
          )}

          {week.customRationale && (
            <div className="text-xs text-muted-foreground italic">
              Custom week rationale: {week.customRationale}
            </div>
          )}

          {week.isMilestone && week.milestoneName && (
            <div className="flex items-center gap-2 text-sm font-medium text-purple-700">
              <Flag className="h-4 w-4" />
              <span>Milestone: {week.milestoneName}</span>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function ProposedProgrammePreview({ programme, weeks }: ProposedProgrammePreviewProps) {
  const stageInfo = getStageInfo(programme.startingStage)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Proposed Programme</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Starting: {stageInfo.label}</Badge>
              <Badge variant="secondary">{programme.totalWeeks} weeks</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {programme.programmeRationale && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <span className="text-xs font-medium text-muted-foreground uppercase">Rationale</span>
              <p className="text-sm mt-1">{programme.programmeRationale}</p>
            </div>
          )}

          {Object.keys(programme.successMetrics).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Success Metrics</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(programme.successMetrics).map(([key, value]) => (
                  <div key={key} className="p-3 border rounded-lg text-center">
                    <div className="text-lg font-bold">
                      {typeof value === 'number'
                        ? key.includes('mrr')
                          ? `$${(value / 100).toLocaleString()}`
                          : value.toLocaleString()
                        : value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {programme.conditions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Conditions</span>
              </div>
              <ul className="space-y-2">
                {programme.conditions.map((condition, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between text-sm p-2 border rounded-lg"
                  >
                    <span>{condition.condition}</span>
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      Week {condition.dueByWeek}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {programme.mentorRecommendations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Mentor Recommendations</span>
              </div>
              <div className="space-y-2">
                {programme.mentorRecommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge
                      className={cn(
                        'text-xs',
                        rec.priority === 1
                          ? 'bg-red-100 text-red-700'
                          : rec.priority === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                      )}
                    >
                      P{rec.priority}
                    </Badge>
                    <div>
                      <span className="font-medium text-sm">{rec.domain}</span>
                      <p className="text-xs text-muted-foreground mt-1">{rec.rationale}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {weeks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Milestones</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {weeks.map((week, index) => (
                <WeekCard key={week.id} week={week} defaultOpen={index === 0} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
