'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquareWarning } from 'lucide-react'
import type { DDFollowUpQuestion } from '@/lib/ai/types/due-diligence'
import { DD_CATEGORY_LABELS } from '@/lib/ai/types/due-diligence'

const priorityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-600',
  high: 'bg-yellow-100 text-yellow-600',
  medium: 'bg-blue-100 text-blue-600',
  low: 'bg-muted text-muted-foreground',
}

const sourceLabels: Record<string, string> = {
  omission: 'Missing Info',
  unverified_claim: 'Unverified',
  disputed_claim: 'Disputed',
  benchmark_flag: 'Benchmark',
  ai_generated: 'AI Suggested',
}

interface DDFollowUpQuestionsProps {
  questions: DDFollowUpQuestion[]
}

export function DDFollowUpQuestions({ questions }: DDFollowUpQuestionsProps) {
  if (questions.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquareWarning className="h-4 w-4" />
          Follow-up Questions ({questions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={idx} className="p-3 border rounded-lg space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={priorityColors[q.priority] || priorityColors.medium}>
                  {q.priority}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {DD_CATEGORY_LABELS[q.category as keyof typeof DD_CATEGORY_LABELS] || q.category}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {sourceLabels[q.source] || q.source}
                </Badge>
              </div>
              <p className="text-sm font-medium">{q.question}</p>
              <p className="text-xs text-muted-foreground">{q.reason}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
