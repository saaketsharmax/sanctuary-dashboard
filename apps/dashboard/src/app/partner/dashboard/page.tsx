'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  FileCheck,
  Users,
  ArrowRight,
  TrendingUp,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface Application {
  id: string
  status: string
  companyName: string
  companyOneLiner: string
}

export default function PartnerDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('Partner')

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch applications
        const res = await fetch('/api/partner/applications')
        const data = await res.json()
        if (data.success) {
          setApplications(data.applications || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const pendingApplications = applications.filter(
    app => app.status === 'assessment_generated' || app.status === 'under_review' || app.status === 'interview_completed'
  )

  const totalApplications = applications.length
  const submittedCount = applications.filter(a => a.status !== 'draft').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your dashboard overview
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Applications</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalApplications}</p>
            <p className="text-xs text-muted-foreground mt-1">{submittedCount} submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Pending Reviews</span>
            </div>
            <p className="text-2xl font-bold mt-1">{pendingApplications.length}</p>
            <p className="text-xs text-muted-foreground mt-1">need review</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Portfolio</span>
            </div>
            <p className="text-2xl font-bold mt-1">0</p>
            <p className="text-xs text-muted-foreground mt-1">startups</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Mentors</span>
            </div>
            <p className="text-2xl font-bold mt-1">0</p>
            <p className="text-xs text-muted-foreground mt-1">available</p>
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
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{app.companyOneLiner}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {app.status === 'assessment_generated' ? 'Ready' : 'In Review'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No pending applications</p>
            )}
            <Link href="/partner/applications">
              <Button variant="ghost" size="sm" className="w-full mt-4">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Portfolio</CardTitle>
              <Badge variant="secondary">0</Badge>
            </div>
            <CardDescription>Your startups</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground py-4 text-center">No startups in portfolio yet</p>
            <Link href="/partner/portfolio">
              <Button variant="ghost" size="sm" className="w-full mt-4">
                View Portfolio <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Mentors */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Mentors</CardTitle>
              <Badge variant="secondary">0</Badge>
            </div>
            <CardDescription>Available mentors</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground py-4 text-center">No mentors added yet</p>
            <Link href="/partner/mentors">
              <Button variant="ghost" size="sm" className="w-full mt-4">
                View Mentors <ArrowRight className="h-4 w-4 ml-1" />
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
