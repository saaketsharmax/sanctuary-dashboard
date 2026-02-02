'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  DollarSign,
  AlertTriangle,
  FileCheck,
  Users,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { mockPartner } from '@/lib/stores/auth-store'
import { getPortfolioStats, getAllStartupsWithFounders, getPendingMatchesWithNames } from '@/lib/mock-data'
import { getAllApplicationsWithFounders } from '@/lib/mock-data/onboarding'

export default function PartnerDashboard() {
  const stats = getPortfolioStats()
  const startups = getAllStartupsWithFounders()
  const applications = getAllApplicationsWithFounders()
  const pendingMatches = getPendingMatchesWithNames()

  const pendingApplications = applications.filter(
    app => app.status === 'assessment_generated' || app.status === 'under_review'
  )
  const atRiskStartups = startups.filter(
    s => s.riskLevel === 'elevated' || s.riskLevel === 'high'
  )

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {mockPartner.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your portfolio overview
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Startups</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.totalStartups}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.activeStartups} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total MRR</span>
            </div>
            <p className="text-2xl font-bold mt-1">${stats.totalMRR.toLocaleString()}</p>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +15% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Pending Reviews</span>
            </div>
            <p className="text-2xl font-bold mt-1">{pendingApplications.length}</p>
            <p className="text-xs text-muted-foreground mt-1">applications to review</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">At Risk</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-yellow-600">{atRiskStartups.length}</p>
            <p className="text-xs text-muted-foreground mt-1">need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pending Applications */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Pending Applications</CardTitle>
              <Badge variant="secondary">{pendingApplications.length}</Badge>
            </div>
            <CardDescription>Applications awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingApplications.length > 0 ? (
              <div className="space-y-3">
                {pendingApplications.slice(0, 3).map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{app.companyName}</p>
                      <p className="text-xs text-muted-foreground">{app.companyOneLiner}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {app.status === 'assessment_generated' ? 'Ready' : 'In Review'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending applications</p>
            )}
            <Link href="/partner/applications">
              <Button variant="ghost" size="sm" className="w-full mt-4">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Pending Matches */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Mentor Matches</CardTitle>
              <Badge variant="secondary">{pendingMatches.length}</Badge>
            </div>
            <CardDescription>Matches awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingMatches.length > 0 ? (
              <div className="space-y-3">
                {pendingMatches.slice(0, 3).map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{match.mentorName}</p>
                      <p className="text-xs text-muted-foreground">→ {match.startupName}</p>
                    </div>
                    <Badge className="text-xs">{match.score}%</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending matches</p>
            )}
            <Link href="/partner/matches">
              <Button variant="ghost" size="sm" className="w-full mt-4">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* At-Risk Startups */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">At-Risk Startups</CardTitle>
              <Badge variant="destructive">{atRiskStartups.length}</Badge>
            </div>
            <CardDescription>Startups needing attention</CardDescription>
          </CardHeader>
          <CardContent>
            {atRiskStartups.length > 0 ? (
              <div className="space-y-3">
                {atRiskStartups.slice(0, 3).map((startup) => (
                  <Link key={startup.id} href={`/partner/portfolio/${startup.id}`}>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div>
                        <p className="font-medium text-sm">{startup.name}</p>
                        <p className="text-xs text-muted-foreground">{startup.industry}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={startup.riskLevel === 'high' ? 'border-red-500 text-red-500' : 'border-yellow-500 text-yellow-500'}
                      >
                        {startup.riskLevel}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No at-risk startups</p>
            )}
            <Link href="/partner/portfolio">
              <Button variant="ghost" size="sm" className="w-full mt-4">
                View Portfolio <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Link href="/partner/portfolio">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Briefcase className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="font-medium">Portfolio</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/partner/metrics">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="font-medium">Metrics</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/partner/mentors">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="font-medium">Mentors</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/partner/applications">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <FileCheck className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="font-medium">Applications</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
