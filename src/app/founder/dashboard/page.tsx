import { auth } from '@/lib/auth/auth-config'
import { redirect } from 'next/navigation'
import { FounderHeader } from '@/components/founder/layout/founder-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building2,
  FileText,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Rocket,
} from 'lucide-react'
import Link from 'next/link'
import { getStartupById, getCheckpointsByStartupId, getStartupMetrics } from '@/lib/mock-data'

export default async function FounderDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Get founder's startup data
  const startupId = session.user.startupId
  const startup = startupId ? getStartupById(startupId) : null
  const checkpoints = startupId ? getCheckpointsByStartupId(startupId) : []
  const metrics = startupId ? getStartupMetrics(startupId) : null

  // If founder hasn't completed onboarding (no startup), show onboarding prompt
  if (!startup) {
    return (
      <div className="flex flex-col">
        <FounderHeader
          title="Welcome to Sanctuary"
          description="Let's get your startup journey started"
        />
        <div className="flex-1 p-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Rocket className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl">Start Your Application</CardTitle>
              <CardDescription>
                Complete your application to join the Sanctuary accelerator programme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Tell us about your startup</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Complete an AI-powered interview</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Get matched with mentors</span>
                </div>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href="/founder/apply">
                  Start Application
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const completedCheckpoints = checkpoints.filter((c) => c.status === 'completed').length
  const totalCheckpoints = checkpoints.length
  const activeCheckpoint = checkpoints.find((c) => c.status === 'in_progress')

  return (
    <div className="flex flex-col">
      <FounderHeader
        title={`Welcome back, ${session.user.name?.split(' ')[0]}`}
        description={startup.name}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Company Overview Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              {startup.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={startup.logoUrl} alt={startup.name} className="h-10 w-10 rounded" />
              ) : (
                <Building2 className="h-6 w-6" />
              )}
            </div>
            <div className="flex-1">
              <CardTitle>{startup.name}</CardTitle>
              <CardDescription>{startup.oneLiner}</CardDescription>
            </div>
            <Badge variant="outline" className="capitalize">
              {startup.stage.replace('_', ' ')}
            </Badge>
          </CardHeader>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${metrics ? (metrics.current.mrr / 100).toLocaleString() : '0'}
              </div>
              {metrics && (
                <p className="text-xs text-muted-foreground">
                  {metrics.mrrTrend === 'up' ? '+' : metrics.mrrTrend === 'down' ? '-' : ''}
                  {Math.abs(metrics.mrrChange)}% from last month
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.current.activeUsers.toLocaleString() || '0'}
              </div>
              {metrics && (
                <p className="text-xs text-muted-foreground">
                  {metrics.userTrend === 'up' ? '+' : metrics.userTrend === 'down' ? '-' : ''}
                  {Math.abs(metrics.userChange)}% from last month
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedCheckpoints}/{totalCheckpoints}
              </div>
              <p className="text-xs text-muted-foreground">checkpoints completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{startup.overallScore || '--'}</div>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Checkpoint */}
        {activeCheckpoint && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Current Checkpoint</CardTitle>
                  <CardDescription>Week {activeCheckpoint.weekNumber}</CardDescription>
                </div>
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  In Progress
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{activeCheckpoint.goal}</p>
              {activeCheckpoint.checkpointQuestion && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {activeCheckpoint.checkpointQuestion}
                </p>
              )}
              <Button asChild variant="outline" className="mt-4">
                <Link href="/founder/progress">
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:border-blue-500 transition-colors cursor-pointer">
            <Link href="/founder/company">
              <CardHeader>
                <Building2 className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg">Company Profile</CardTitle>
                <CardDescription>Update your startup information</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:border-blue-500 transition-colors cursor-pointer">
            <Link href="/founder/documents">
              <CardHeader>
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg">Documents</CardTitle>
                <CardDescription>Upload pitch decks and files</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:border-blue-500 transition-colors cursor-pointer">
            <Link href="/founder/requests">
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg">Get Help</CardTitle>
                <CardDescription>Request mentor or feature support</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
