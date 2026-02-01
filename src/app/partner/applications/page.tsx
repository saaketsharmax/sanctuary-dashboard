'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PartnerHeader } from '@/components/partner/layout/partner-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  MessageSquare,
} from 'lucide-react'
import { getAllApplicationsWithFounders, getOnboardingStats } from '@/lib/mock-data'
import { APPLICATION_STAGES } from '@/types'

function getStatusBadge(status: string) {
  const configs: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700', icon: <FileText className="h-3 w-3" /> },
    submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-700', icon: <Clock className="h-3 w-3" /> },
    interview_scheduled: { label: 'Interview Scheduled', className: 'bg-purple-100 text-purple-700', icon: <Calendar className="h-3 w-3" /> },
    interview_completed: { label: 'Interview Done', className: 'bg-indigo-100 text-indigo-700', icon: <MessageSquare className="h-3 w-3" /> },
    assessment_generated: { label: 'Assessment Ready', className: 'bg-cyan-100 text-cyan-700', icon: <FileText className="h-3 w-3" /> },
    under_review: { label: 'Under Review', className: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-3 w-3" /> },
    approved: { label: 'Approved', className: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3 w-3" /> },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> },
    withdrawn: { label: 'Withdrawn', className: 'bg-gray-100 text-gray-700', icon: <XCircle className="h-3 w-3" /> },
  }
  return configs[status] || configs.draft
}

export default function PartnerApplicationsPage() {
  const [filter, setFilter] = useState<string>('all')

  const applications = getAllApplicationsWithFounders()
  const stats = getOnboardingStats()

  // Group applications by status for easy filtering
  const needsReview = applications.filter(
    (app) => ['submitted', 'interview_completed', 'assessment_generated'].includes(app.status)
  )
  const inProgress = applications.filter(
    (app) => ['interview_scheduled', 'under_review'].includes(app.status)
  )
  const decided = applications.filter(
    (app) => ['approved', 'rejected', 'withdrawn'].includes(app.status)
  )

  const filteredApplications = filter === 'all'
    ? applications
    : filter === 'needs_review'
    ? needsReview
    : filter === 'in_progress'
    ? inProgress
    : decided

  return (
    <div className="flex flex-col h-full">
      <PartnerHeader
        title="Applications"
        description="Review startup applications"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.totalApplications}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Needs Review</p>
              <p className="text-2xl font-bold text-blue-600">{needsReview.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{inProgress.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="needs_review">Needs Review ({needsReview.length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({inProgress.length})</TabsTrigger>
            <TabsTrigger value="decided">Decided ({decided.length})</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            <div className="space-y-4">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app) => {
                  const statusConfig = getStatusBadge(app.status)
                  const stageLabel = APPLICATION_STAGES.find((s) => s.value === app.stage)?.label || app.stage
                  const leadFounder = app.founders.find((f) => f.isLead) || app.founders[0]

                  return (
                    <Card key={app.id} className="hover:border-green-500 transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                            <Building2 className="h-6 w-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-lg">{app.companyName}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {app.companyOneLiner}
                                </p>
                              </div>
                              <Badge className={statusConfig.className}>
                                {statusConfig.icon}
                                <span className="ml-1">{statusConfig.label}</span>
                              </Badge>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {leadFounder?.name}
                                  {app.founders.length > 1 && ` +${app.founders.length - 1}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline">{stageLabel}</Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Submitted {app.submittedAt
                                    ? new Date(app.submittedAt).toLocaleDateString()
                                    : 'N/A'}
                                </span>
                              </div>
                            </div>

                            {app.biggestChallenge && (
                              <div className="mt-3 p-3 rounded-lg bg-muted">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Biggest Challenge</p>
                                <p className="text-sm line-clamp-2">{app.biggestChallenge}</p>
                              </div>
                            )}

                            <div className="mt-4 flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/interview/${app.id}`}>
                                  View Interview
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                              {['assessment_generated', 'under_review'].includes(app.status) && (
                                <Button size="sm">
                                  Review Assessment
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No applications in this category</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
