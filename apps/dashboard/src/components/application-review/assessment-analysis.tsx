'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  cn,
} from '@sanctuary/ui'
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Target,
  Users,
  Calendar,
  Shield,
} from 'lucide-react'
import type { Assessment, AssessmentStrength, AssessmentRisk } from '@/types'

interface AssessmentAnalysisProps {
  assessment: Assessment
}

function StrengthCard({ strength }: { strength: AssessmentStrength }) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <h4 className="font-medium text-sm">{strength.strength}</h4>
          <p className="text-xs text-muted-foreground italic">"{strength.evidence}"</p>
          <p className="text-xs text-green-700">{strength.impact}</p>
        </div>
      </div>
    </div>
  )
}

function RiskCard({ risk }: { risk: AssessmentRisk }) {
  const severityColors = {
    low: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    medium: 'bg-orange-100 text-orange-700 border-orange-200',
    high: 'bg-red-100 text-red-700 border-red-200',
    critical: 'bg-red-200 text-red-800 border-red-300',
  }

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-sm">{risk.risk}</h4>
            <Badge className={cn('text-xs uppercase', severityColors[risk.severity])}>
              {risk.severity}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground italic">"{risk.evidence}"</p>
          <div className="flex items-start gap-1 text-xs">
            <Shield className="h-3 w-3 mt-0.5 text-blue-600" />
            <span className="text-blue-700">{risk.mitigation}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AssessmentAnalysis({ assessment }: AssessmentAnalysisProps) {
  return (
    <div className="space-y-6">
      {assessment.keyStrengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Key Strengths ({assessment.keyStrengths.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assessment.keyStrengths.map((strength, index) => (
              <StrengthCard key={index} strength={strength} />
            ))}
          </CardContent>
        </Card>
      )}

      {assessment.keyRisks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Key Risks ({assessment.keyRisks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assessment.keyRisks.map((risk, index) => (
              <RiskCard key={index} risk={risk} />
            ))}
          </CardContent>
        </Card>
      )}

      {assessment.criticalQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              Critical Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment.criticalQuestions.map((question, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground">{index + 1}.</span>
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            Needs & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {assessment.primaryNeed && (
            <div>
              <span className="text-sm font-medium">Primary Need:</span>
              <p className="text-sm text-muted-foreground mt-1">{assessment.primaryNeed}</p>
            </div>
          )}

          {assessment.secondaryNeeds.length > 0 && (
            <div>
              <span className="text-sm font-medium">Secondary Needs:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {assessment.secondaryNeeds.map((need, index) => (
                  <Badge key={index} variant="outline">
                    {need}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {assessment.mentorDomains.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Mentor Domains:</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {assessment.mentorDomains.map((domain, index) => (
                  <Badge key={index} variant="secondary">
                    {domain}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {assessment.fundraisingTimeline && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">Fundraising Timeline:</span>{' '}
                {assessment.fundraisingTimeline}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
