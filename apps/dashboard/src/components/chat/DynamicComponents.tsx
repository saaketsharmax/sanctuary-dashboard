'use client'

import { Button } from '@sanctuary/ui'
import { TrendingUp, TrendingDown, CheckCircle2, Circle, Target, FileText, ExternalLink } from 'lucide-react'
interface MetricCardProps {
  label: string
  value: string
  change: string
}

export function MetricCard({ label, value, change }: MetricCardProps) {
  const isPositive = change.startsWith('+')

  return (
    <div className="border-l-2 border-primary pl-4 py-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {isPositive ? (
          <TrendingUp className="w-3 h-3 text-success" />
        ) : (
          <TrendingDown className="w-3 h-3 text-destructive" />
        )}
        <p className={`text-xs ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {change}
        </p>
      </div>
    </div>
  )
}

interface TaskItemProps {
  id: string
  title: string
  status: string
}

export function TaskItem({ id, title, status }: TaskItemProps) {
  const completed = status === 'completed' || status === 'done'

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          completed
            ? 'bg-success border-success'
            : 'border-muted-foreground/30'
        }`}
      >
        {completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <p className={`text-sm flex-1 ${
        completed ? 'text-muted-foreground line-through' : 'text-foreground'
      }`}>
        {title}
      </p>
    </div>
  )
}

interface GoalProgressProps {
  title: string
  current: number
  target: number
}

export function GoalProgress({ title, current, target }: GoalProgressProps) {
  const percentage = Math.min((current / target) * 100, 100)

  return (
    <div className="py-4 border-l-2 border-primary pl-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Target className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground mb-1">{title}</p>
          <p className="text-xs text-muted-foreground">
            {current} / {target} ({percentage.toFixed(0)}%)
          </p>
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary rounded-full h-2 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface ChartCardProps {
  chartType: string
  dataKey: string
}

export function ChartCard({ chartType, dataKey }: ChartCardProps) {
  // Placeholder for actual chart implementation
  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <p className="text-sm text-muted-foreground mb-2">Chart: {chartType}</p>
      <div className="h-32 bg-muted rounded flex items-center justify-center">
        <p className="text-xs text-muted-foreground">
          {dataKey} visualization
        </p>
      </div>
    </div>
  )
}

interface DocumentRefProps {
  id: string
  name: string
  type: string
}

export function DocumentRef({ id, name, type }: DocumentRefProps) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer group">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{type}</p>
      </div>
      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="w-4 h-4" />
      </Button>
    </div>
  )
}

// Component registry for dynamic rendering
export const DynamicComponentRegistry = {
  metric: MetricCard,
  task: TaskItem,
  goal: GoalProgress,
  chart: ChartCard,
  document: DocumentRef,
}

interface DynamicComponentProps {
  type: string
  props: any
}

export function DynamicComponent({ type, props }: DynamicComponentProps) {
  const Component = DynamicComponentRegistry[type as keyof typeof DynamicComponentRegistry]

  if (!Component) {
    return null
  }

  return <Component {...props} />
}
