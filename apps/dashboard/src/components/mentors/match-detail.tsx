'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Avatar,
  AvatarFallback,
  Progress,
} from '@sanctuary/ui'
import { Check, X, Send, ArrowRight, AlertCircle, CheckCircle, Link2 } from 'lucide-react'
import type { Match } from '@/types'

const statusColors: Record<string, string> = {
  pending: 'bg-warning/15 text-warning',
  approved: 'bg-success/15 text-success',
  rejected: 'bg-destructive/15 text-destructive',
  intro_sent: 'bg-info/15 text-info',
  completed: 'bg-muted text-foreground',
}

interface MatchDetailProps {
  match: Match
}

export function MatchDetail({ match }: MatchDetailProps) {
  // No mock data lookups - show placeholder for when real data is available
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Match Details</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Match details will be displayed here once mentor matching is connected to the database.
            </p>
            <div className="mt-4">
              <Badge className={statusColors[match.status] || statusColors.pending}>
                {match.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Match Score: {match.score}%</p>
              <Progress value={match.score} className="h-2 mt-2 max-w-xs mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
