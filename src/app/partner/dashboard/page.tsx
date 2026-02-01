import { auth } from '@/lib/auth/auth-config'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PartnerHeader } from '@/components/partner/layout/partner-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  Users,
  FileText,
  Handshake,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import {
  getPortfolioStats,
  getPortfolioMetrics,
  getAllApplicationsWithFounders,
  getPendingMatchesWithDetails,
  getAllStartupsWithFounders,
} from '@/lib/mock-data'
import { formatCurrency } from '@/types'

export default async function PartnerDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const stats = getPortfolioStats()
  const portfolioMetrics = getPortfolioMetrics()
  const applications = getAllApplicationsWithFounders()
  const pendingMatches = getPendingMatchesWithDetails()
  const startups = getAllStartupsWithFounders()

  // Get applications needing review
  const pendingApplications = applications.filter(
    (app) => app.status === 'submitted' || app.status === 'interview_completed' || app.status === 'assessment_generated'
  )

  // Get at-risk startups
  const atRiskStartups = startups.filter((s) => s.riskLevel === 'elevated' || s.riskLevel === 'high')

  return (
    <div className="flex flex-col h-full">
      <PartnerHeader
        title={`Welcome back, ${session.user.name?.split(' ')[0]}`}
        description="Partner Dashboard"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Startups</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStartups}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeStartups} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Portfolio MRR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(portfolioMetrics.totalMRR)}
              </div>
              <p className="text-xs text-muted-foreground">
                across all startups
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApplications.length}</div>
              <p className="text-xs text-muted-foreground">
                applications to review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">At Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{atRiskStartups.length}</div>
              <p className="text-xs text-muted-foreground">
                startups need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Applications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Pending Applications</CardTitle>
                  <CardDescription>Applications awaiting your review</CardDescription>
                </div>
                <Badge variant="secondary">{pendingApplications.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {pendingApplications.length > 0 ? (
                <div className="space-y-4">
                  {pendingApplications.slice(0, 4).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{app.companyName}</p>
                          <p className="text-sm text-muted-foreground">
                            {app.founders.length} founder{app.founders.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          app.status === 'assessment_generated'
                            ? 'border-green-500 text-green-600'
                            : app.status === 'interview_completed'
                            ? 'border-blue-500 text-blue-600'
                            : ''
                        }
                      >
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/partner/applications">
                      View All Applications
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
                  <p className="text-muted-foreground">All caught up!</p>
                  <p className="text-sm text-muted-foreground">No pending applications</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Matches */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Mentor Matches</CardTitle>
                  <CardDescription>Matches awaiting approval</CardDescription>
                </div>
                <Badge variant="secondary">{pendingMatches.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {pendingMatches.length > 0 ? (
                <div className="space-y-4">
                  {pendingMatches.slice(0, 4).map((match) => (
                    <Link
                      key={match.id}
                      href={`/partner/matches/${match.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-sm font-bold text-green-700 dark:text-green-300">
                          {match.score}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{match.mentor.name}</p>
                          <p className="text-xs text-muted-foreground">
                            → {match.startup.name}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{match.confidence}</Badge>
                    </Link>
                  ))}
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/partner/mentors">
                      View All Matches
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Handshake className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending matches</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* At Risk Startups */}
        {atRiskStartups.length > 0 && (
          <Card className="border-yellow-200 dark:border-yellow-900">
            <CardHeader className="bg-yellow-50 dark:bg-yellow-950/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-lg">Startups Needing Attention</CardTitle>
              </div>
              <CardDescription>
                These startups have elevated or high risk levels
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {atRiskStartups.slice(0, 6).map((startup) => (
                  <Link
                    key={startup.id}
                    href={`/partner/portfolio/${startup.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{startup.name}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={startup.overallScore || 0} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{startup.overallScore || 0}</span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        startup.riskLevel === 'high'
                          ? 'border-red-500 text-red-600'
                          : 'border-yellow-500 text-yellow-600'
                      }
                    >
                      {startup.riskLevel}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:border-green-500 transition-colors cursor-pointer">
            <Link href="/partner/portfolio">
              <CardHeader>
                <Building2 className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle className="text-lg">View Portfolio</CardTitle>
                <CardDescription>Manage all startups</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:border-green-500 transition-colors cursor-pointer">
            <Link href="/partner/metrics">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle className="text-lg">Metrics</CardTitle>
                <CardDescription>Portfolio-wide analytics</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:border-green-500 transition-colors cursor-pointer">
            <Link href="/partner/mentors">
              <CardHeader>
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle className="text-lg">Mentor Matching</CardTitle>
                <CardDescription>Connect founders with mentors</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
