'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Building2,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { mockFounder } from '@/lib/stores/auth-store'

// Mock data for founder dashboard
const founderData = {
  company: {
    name: 'TechFlow AI',
    oneLiner: 'AI-powered workflow automation for SMBs',
    stage: 'Solution Shaping',
    progress: 45,
  },
  metrics: {
    mrr: 8500,
    mrrGrowth: 12,
    activeUsers: 234,
    userGrowth: 8,
  },
  currentCheckpoint: {
    name: 'MVP Launch',
    dueDate: '2026-02-15',
    tasksCompleted: 3,
    totalTasks: 5,
  },
  recentActivity: [
    { type: 'feedback', message: 'Partner feedback on pitch deck', time: '2 hours ago' },
    { type: 'milestone', message: 'Completed user interview milestone', time: '1 day ago' },
    { type: 'match', message: 'New mentor match: Alex Rivera', time: '3 days ago' },
  ],
}

export default function FounderDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {mockFounder.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s how {founderData.company.name} is progressing
        </p>
      </div>

      {/* Company Overview Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">{founderData.company.name}</CardTitle>
            <CardDescription>{founderData.company.oneLiner}</CardDescription>
          </div>
          <Badge>{founderData.company.stage}</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Programme Progress</span>
              <span className="font-medium">{founderData.company.progress}%</span>
            </div>
            <Progress value={founderData.company.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">MRR</span>
            </div>
            <p className="text-2xl font-bold mt-1">${founderData.metrics.mrr.toLocaleString()}</p>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +{founderData.metrics.mrrGrowth}% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active Users</span>
            </div>
            <p className="text-2xl font-bold mt-1">{founderData.metrics.activeUsers}</p>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +{founderData.metrics.userGrowth}% this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Checkpoint</span>
            </div>
            <p className="text-lg font-bold mt-1">{founderData.currentCheckpoint.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {founderData.currentCheckpoint.tasksCompleted}/{founderData.currentCheckpoint.totalTasks} tasks done
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Due Date</span>
            </div>
            <p className="text-lg font-bold mt-1">Feb 15</p>
            <p className="text-xs text-muted-foreground mt-1">13 days remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/founder/company">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <Building2 className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold">Company Profile</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Update your company information and pitch
              </p>
              <Button variant="ghost" size="sm" className="mt-3 p-0">
                Edit Profile <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/founder/documents">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold">Documents</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upload pitch decks and financials
              </p>
              <Button variant="ghost" size="sm" className="mt-3 p-0">
                Manage Docs <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/founder/requests">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <MessageSquare className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold">Get Help</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Request a mentor or feature support
              </p>
              <Button variant="ghost" size="sm" className="mt-3 p-0">
                Make Request <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {founderData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
