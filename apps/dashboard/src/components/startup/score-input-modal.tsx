'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Slider,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  cn,
} from '@sanctuary/ui'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Users, Lightbulb, Target, Zap, Info } from 'lucide-react'
import type { Startup } from '@/types'
import { calculateOverallScore, calculateRiskLevel } from '@/types'

const scoreSchema = z.object({
  founderScore: z.number().min(0).max(100),
  problemScore: z.number().min(0).max(100),
  userValueScore: z.number().min(0).max(100),
  executionScore: z.number().min(0).max(100),
})

type ScoreFormData = z.infer<typeof scoreSchema>

interface ScoreInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  startup: Startup
  onSuccess?: (scores: ScoreFormData) => void
}

const scoreInfo = {
  founderScore: {
    label: 'Founder Score',
    icon: Users,
    weight: '25%',
    description: 'Team quality, skills, commitment, and coachability',
    criteria: [
      'Technical/domain expertise',
      'Previous startup experience',
      'Leadership ability',
      'Coachability and responsiveness',
      'Team dynamics and complementary skills',
    ],
  },
  problemScore: {
    label: 'Problem Score',
    icon: Lightbulb,
    weight: '25%',
    description: 'Problem validity, market size, and urgency',
    criteria: [
      'Problem clearly defined and validated',
      'Market size (TAM/SAM/SOM)',
      'Customer pain level (hair on fire?)',
      'Willingness to pay demonstrated',
      'Timing and market trends',
    ],
  },
  userValueScore: {
    label: 'User Value Score',
    icon: Target,
    weight: '30%',
    description: 'Product-market fit indicators and user engagement',
    criteria: [
      'User retention (D1/D7/D30)',
      'Engagement metrics',
      'Net Promoter Score',
      'Organic growth/referrals',
      'Revenue or strong intent signals',
    ],
  },
  executionScore: {
    label: 'Execution Score',
    icon: Zap,
    weight: '20%',
    description: 'Speed and quality of execution',
    criteria: [
      'Velocity of shipping',
      'Quality of output',
      'Resource efficiency',
      'Milestone achievement',
      'Adaptability to feedback',
    ],
  },
}

interface ScoreSliderProps {
  name: keyof typeof scoreInfo
  value: number
  onChange: (value: number) => void
  error?: string
}

function ScoreSlider({ name, value, onChange, error }: ScoreSliderProps) {
  const info = scoreInfo[name]
  const Icon = info.icon

  const getScoreColor = (v: number) => {
    if (v >= 75) return 'text-green-600'
    if (v >= 50) return 'text-blue-600'
    if (v >= 25) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSliderColor = (v: number) => {
    if (v >= 75) return '[&>span:first-child]:bg-green-500'
    if (v >= 50) return '[&>span:first-child]:bg-blue-500'
    if (v >= 25) return '[&>span:first-child]:bg-yellow-500'
    return '[&>span:first-child]:bg-red-500'
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">{info.label}</Label>
          <span className="text-xs text-muted-foreground">({info.weight})</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="font-medium mb-2">{info.description}</p>
                <ul className="text-xs space-y-1">
                  {info.criteria.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onChange(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
            className="w-16 h-8 text-center"
          />
          <span className={cn('text-lg font-bold w-8', getScoreColor(value))}>
            /100
          </span>
        </div>
      </div>

      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={100}
        step={1}
        className={cn('w-full', getSliderColor(value))}
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0 - Critical</span>
        <span>25 - Weak</span>
        <span>50 - Average</span>
        <span>75 - Strong</span>
        <span>100 - Excellent</span>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function ScoreInputModal({
  open,
  onOpenChange,
  startup,
  onSuccess,
}: ScoreInputModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ScoreFormData>({
    resolver: zodResolver(scoreSchema),
    defaultValues: {
      founderScore: startup.founderScore ?? 50,
      problemScore: startup.problemScore ?? 50,
      userValueScore: startup.userValueScore ?? 50,
      executionScore: startup.executionScore ?? 50,
    },
  })

  const values = watch()
  const calculatedOverall = calculateOverallScore(
    values.founderScore,
    values.problemScore,
    values.userValueScore,
    values.executionScore
  )
  const riskLevel = calculateRiskLevel(calculatedOverall)

  const getOverallColor = (score: number | null) => {
    if (score === null) return 'text-gray-500'
    if (score >= 75) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 50) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 25) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const onSubmit = async (data: ScoreFormData) => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log('Updated scores:', data)
    onSuccess?.(data)
    onOpenChange(false)
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Scores — {startup.name}</DialogTitle>
          <DialogDescription>
            Adjust the investment readiness scores. Each dimension has criteria to guide scoring.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Overall Score Preview */}
          <div className={cn('rounded-lg border-2 p-4 text-center', getOverallColor(calculatedOverall))}>
            <p className="text-sm font-medium mb-1">Overall Score (Calculated)</p>
            <p className="text-4xl font-bold">{calculatedOverall ?? '—'}</p>
            <p className="text-xs mt-1">
              Risk Level: <span className="font-medium capitalize">{riskLevel}</span>
            </p>
          </div>

          {/* Score Sliders */}
          <div className="space-y-3">
            <ScoreSlider
              name="founderScore"
              value={values.founderScore}
              onChange={(v) => setValue('founderScore', v)}
              error={errors.founderScore?.message}
            />
            <ScoreSlider
              name="problemScore"
              value={values.problemScore}
              onChange={(v) => setValue('problemScore', v)}
              error={errors.problemScore?.message}
            />
            <ScoreSlider
              name="userValueScore"
              value={values.userValueScore}
              onChange={(v) => setValue('userValueScore', v)}
              error={errors.userValueScore?.message}
            />
            <ScoreSlider
              name="executionScore"
              value={values.executionScore}
              onChange={(v) => setValue('executionScore', v)}
              error={errors.executionScore?.message}
            />
          </div>

          {/* Weight Explanation */}
          <div className="text-xs text-muted-foreground text-center p-2 bg-accent/50 rounded">
            Formula: (Founder × 25%) + (Problem × 25%) + (User Value × 30%) + (Execution × 20%)
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Scores'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
