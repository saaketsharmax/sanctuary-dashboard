'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
} from '@sanctuary/ui'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
interface MemoSectionProps {
  title: string
  description?: string
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive'
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
  children: React.ReactNode
}

export function MemoSection({
  title,
  description,
  badge,
  badgeVariant = 'secondary',
  collapsible = false,
  defaultOpen = true,
  className,
  children,
}: MemoSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (collapsible) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className={className}>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{title}</CardTitle>
                {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {description && (
                <CardDescription className="mb-4">{description}</CardDescription>
              )}
              {children}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// Score display component for dimension scores
interface ScoreDisplayProps {
  label: string
  score: number
  reasoning: string
  showBar?: boolean
}

export function ScoreDisplay({ label, score, reasoning, showBar = true }: ScoreDisplayProps) {
  const getScoreColor = (s: number) => {
    if (s >= 85) return 'text-success'
    if (s >= 70) return 'text-info'
    if (s >= 50) return 'text-warning'
    return 'text-destructive'
  }

  const getBarColor = (s: number) => {
    if (s >= 85) return 'bg-success'
    if (s >= 70) return 'bg-info'
    if (s >= 50) return 'bg-warning'
    return 'bg-destructive'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className={cn('font-bold', getScoreColor(score))}>{score}/100</span>
      </div>
      {showBar && (
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', getBarColor(score))}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
      <p className="text-xs text-muted-foreground">{reasoning}</p>
    </div>
  )
}

// Risk item display
interface RiskItemProps {
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  mitigation?: string | null
}

export function RiskItem({ title, description, severity, source, mitigation }: RiskItemProps) {
  const severityColors = {
    low: 'bg-success/15 text-success',
    medium: 'bg-warning/15 text-warning',
    high: 'bg-warning/15 text-warning',
    critical: 'bg-destructive/15 text-destructive',
  }

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-sm">{title}</span>
        <Badge className={severityColors[severity]}>{severity}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {mitigation && (
        <p className="text-xs text-info">
          <span className="font-medium">Mitigation:</span> {mitigation}
        </p>
      )}
      <p className="text-xs text-muted-foreground">Source: {source}</p>
    </div>
  )
}

// Competitor card
interface CompetitorCardProps {
  name: string
  description: string
  funding: string
  positioning: string
  threatLevel: 'high' | 'medium' | 'low'
}

export function CompetitorCard({
  name,
  description,
  funding,
  positioning,
  threatLevel,
}: CompetitorCardProps) {
  const threatColors = {
    low: 'border-success/30 bg-success/10',
    medium: 'border-warning/30 bg-warning/10',
    high: 'border-destructive/30 bg-destructive/10',
  }

  return (
    <div className={cn('border rounded-lg p-3 space-y-1', threatColors[threatLevel])}>
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{name}</span>
        <Badge variant="outline" className="text-xs">
          {threatLevel} threat
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <p className="text-xs">
        <span className="font-medium">Funding:</span> {funding}
      </p>
      <p className="text-xs">
        <span className="font-medium">vs. us:</span> {positioning}
      </p>
    </div>
  )
}

// Founder background card
interface FounderCardProps {
  name: string
  role: string
  background: string
  expertise: string[]
  validated: boolean
}

export function FounderCard({ name, role, background, expertise, validated }: FounderCardProps) {
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">{name}</span>
          <span className="text-sm text-muted-foreground ml-2">{role}</span>
        </div>
        {validated && (
          <Badge variant="outline" className="text-xs text-success border-success/40">
            LinkedIn ✓
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{background}</p>
      <div className="flex flex-wrap gap-1">
        {expertise.map((e, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {e}
          </Badge>
        ))}
      </div>
    </div>
  )
}
