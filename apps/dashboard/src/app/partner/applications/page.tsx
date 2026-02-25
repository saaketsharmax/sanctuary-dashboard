'use client'

import {
  Card,
  CardContent,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@sanctuary/ui'
import { useEffect, useState } from 'react'
import { Eye, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Application {
  id: string
  status: string
  companyName: string
  companyOneLiner: string
  companyWebsite: string | null
  stage: string
  userCount: number
  mrr: number
  founders: Array<{
    name: string
    email: string
    isLead: boolean
  }>
  submittedAt: string | null
  createdAt: string
  interviewCompletedAt: string | null
  assessmentCompletedAt: string | null
  aiScore: number | null
}

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
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/partner/applications')
      const data = await res.json()
      if (data.success) {
        setApplications(data.applications)
        setIsMock(data.isMock)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const needsReview = applications.filter(a =>
    a.status === 'assessment_generated' ||
    a.status === 'under_review' ||
    a.status === 'interview_completed'
  )
  const inProgress = applications.filter(a =>
    ['submitted', 'interview_scheduled'].includes(a.status)
  )
  const decided = applications.filter(a =>
    a.status === 'approved' || a.status === 'rejected'
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground mt-1">
            Review founder applications
            {isMock && <Badge variant="outline" className="ml-2">Demo Mode</Badge>}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchApplications}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
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

function ApplicationList({ applications }: { applications: Application[] }) {
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
                  <Badge className={statusColors[app.status] || 'bg-gray-100 text-gray-700'}>
                    {app.status.replace(/_/g, ' ')}
                  </Badge>
                  {app.aiScore && (
                    <Badge variant="outline">
                      Score: {Math.round(app.aiScore * 100)}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{app.companyOneLiner}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Stage: {app.stage?.replace('_', ' ') || 'N/A'}</span>
                  <span>Users: {app.userCount || 0}</span>
                  <span>MRR: ${app.mrr || 0}</span>
                  <span>
                    Submitted: {app.submittedAt
                      ? new Date(app.submittedAt).toLocaleDateString()
                      : 'Draft'}
                  </span>
                  {app.interviewCompletedAt && (
                    <span className="text-green-600">Interview Done</span>
                  )}
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
