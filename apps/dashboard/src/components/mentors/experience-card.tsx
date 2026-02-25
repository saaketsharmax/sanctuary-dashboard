'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@sanctuary/ui'
import { Calendar, Building2, CheckCircle2 } from 'lucide-react'
import { ExpertiseBadge } from './expertise-badge'
import { getStageInfo } from '@/types'
import type { MentorExperience } from '@/types'

interface ExperienceCardProps {
  experience: MentorExperience
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const stageInfo = getStageInfo(experience.companyStage)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-medium">{experience.problemStatement}</CardTitle>
          <ExpertiseBadge archetype={experience.problemArchetype} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Context */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{experience.yearOccurred}</span>
          </div>
          <div className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            <span>{stageInfo.label}</span>
          </div>
        </div>

        {/* Context Description */}
        <div>
          <p className="text-sm font-medium mb-1">Context</p>
          <p className="text-sm text-muted-foreground">{experience.context}</p>
        </div>

        {/* Solution */}
        <div>
          <p className="text-sm font-medium mb-1 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Solution
          </p>
          <p className="text-sm text-muted-foreground">{experience.solution}</p>
        </div>

        {/* Outcomes */}
        <div>
          <p className="text-sm font-medium mb-1">Outcomes</p>
          <p className="text-sm text-muted-foreground">{experience.outcomes}</p>
        </div>
      </CardContent>
    </Card>
  )
}
