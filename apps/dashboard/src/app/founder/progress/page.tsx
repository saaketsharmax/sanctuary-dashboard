'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, Clock, MessageSquare } from 'lucide-react'

const checkpoints = [
  { id: '1', name: 'Problem Validation', status: 'completed', dueDate: '2026-01-15', completedAt: '2026-01-14' },
  { id: '2', name: 'User Interviews (10+)', status: 'completed', dueDate: '2026-01-22', completedAt: '2026-01-20' },
  { id: '3', name: 'MVP Launch', status: 'in_progress', dueDate: '2026-02-15', completedAt: null },
  { id: '4', name: 'First 10 Customers', status: 'pending', dueDate: '2026-03-01', completedAt: null },
  { id: '5', name: 'Product-Market Fit', status: 'pending', dueDate: '2026-03-15', completedAt: null },
]

const partnerFeedback = [
  { date: '2026-01-28', from: 'Alex Rivera', message: 'Great progress on user interviews. Focus on conversion funnel next.' },
  { date: '2026-01-20', from: 'Sarah Mitchell', message: 'Pitch deck looks solid. Consider adding more competitive analysis.' },
]

export default function ProgressPage() {
  const completedCount = checkpoints.filter(c => c.status === 'completed').length
  const progress = (completedCount / checkpoints.length) * 100

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Progress</h1>
        <p className="text-muted-foreground mt-1">Track your programme milestones</p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Programme Progress</span>
            <span className="text-sm text-muted-foreground">{completedCount} of {checkpoints.length} checkpoints</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            You&apos;re in Week 6 of 20 • Solution Shaping phase
          </p>
        </CardContent>
      </Card>

      {/* Checkpoints Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Checkpoints</CardTitle>
          <CardDescription>Your milestone timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checkpoints.map((checkpoint, index) => (
              <div key={checkpoint.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {checkpoint.status === 'completed' ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : checkpoint.status === 'in_progress' ? (
                    <Clock className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                  {index < checkpoints.length - 1 && (
                    <div className={`w-0.5 h-12 mt-2 ${checkpoint.status === 'completed' ? 'bg-green-600' : 'bg-muted'}`} />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{checkpoint.name}</p>
                    <Badge
                      variant={
                        checkpoint.status === 'completed' ? 'default' :
                        checkpoint.status === 'in_progress' ? 'secondary' : 'outline'
                      }
                    >
                      {checkpoint.status === 'completed' ? 'Completed' :
                       checkpoint.status === 'in_progress' ? 'In Progress' : 'Upcoming'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {checkpoint.status === 'completed'
                      ? `Completed on ${checkpoint.completedAt}`
                      : `Due ${checkpoint.dueDate}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Partner Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Partner Feedback
          </CardTitle>
          <CardDescription>Notes and feedback from your partners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partnerFeedback.map((feedback, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{feedback.from}</span>
                  <span className="text-xs text-muted-foreground">{feedback.date}</span>
                </div>
                <p className="text-sm">{feedback.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
