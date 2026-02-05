'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye } from 'lucide-react'
import { getAllApplicationsWithFounders as getAllApplications } from '@/lib/mock-data/onboarding'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  interview_scheduled: 'bg-purple-100 text-purple-700',
  interview_completed: 'bg-indigo-100 text-indigo-700',
  assessment_generated: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function ApplicationsPage() {
  const applications = getAllApplications()

  const needsReview = applications.filter(a => a.status === 'assessment_generated' || a.status === 'under_review')
  const inProgress = applications.filter(a => ['submitted', 'interview_scheduled', 'interview_completed'].includes(a.status))
  const decided = applications.filter(a => a.status === 'approved' || a.status === 'rejected')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-muted-foreground mt-1">Review founder applications</p>
      </div>

      <Tabs defaultValue="needs_review">
        <TabsList>
          <TabsTrigger value="needs_review">
            Needs Review <Badge variant="secondary" className="ml-2">{needsReview.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress <Badge variant="secondary" className="ml-2">{inProgress.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="decided">
            Decided <Badge variant="secondary" className="ml-2">{decided.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="needs_review" className="mt-6">
          <ApplicationList applications={needsReview} />
        </TabsContent>

        <TabsContent value="in_progress" className="mt-6">
          <ApplicationList applications={inProgress} />
        </TabsContent>

        <TabsContent value="decided" className="mt-6">
          <ApplicationList applications={decided} />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <ApplicationList applications={applications} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ApplicationList({ applications }: { applications: any[] }) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No applications in this category
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <Card key={app.id}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{app.companyName}</h3>
                  <Badge className={statusColors[app.status]}>
                    {app.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{app.companyOneLiner}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Stage: {app.stage?.replace('_', ' ') || 'N/A'}</span>
                  <span>Submitted: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'Draft'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/partner/applications/${app.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
