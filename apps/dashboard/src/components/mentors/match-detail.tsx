'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Check, X, Send, ArrowRight, AlertCircle, CheckCircle, Link2 } from 'lucide-react'
import type { Match } from '@/types'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  intro_sent: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-700',
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
