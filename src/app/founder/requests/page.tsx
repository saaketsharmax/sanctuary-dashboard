import { auth } from '@/lib/auth/auth-config'
import { redirect } from 'next/navigation'
import { FounderHeader } from '@/components/founder/layout/founder-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  Plus,
  GraduationCap,
  Lightbulb,
  MessageCircle,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

// Mock requests for demo
const mockRequests = [
  {
    id: 'req-1',
    requestType: 'mentor' as const,
    title: 'Need help with sales strategy',
    description: 'Looking for a mentor with B2B SaaS sales experience to help refine our outbound strategy.',
    priority: 'high' as const,
    status: 'in_review' as const,
    createdAt: '2026-01-20T10:00:00Z',
    responseNotes: null,
  },
  {
    id: 'req-2',
    requestType: 'feature' as const,
    title: 'Request: Export metrics to CSV',
    description: 'Would be helpful to export our metrics data for board presentations.',
    priority: 'medium' as const,
    status: 'approved' as const,
    createdAt: '2026-01-15T14:30:00Z',
    responseNotes: 'Added to the roadmap for Q2!',
  },
  {
    id: 'req-3',
    requestType: 'feedback' as const,
    title: 'Dashboard loading slowly',
    description: 'The metrics dashboard takes a long time to load when there is a lot of data.',
    priority: 'low' as const,
    status: 'completed' as const,
    createdAt: '2026-01-10T09:15:00Z',
    responseNotes: 'Fixed in the latest update. Please refresh and let us know if the issue persists.',
  },
]

function getRequestTypeIcon(type: string) {
  switch (type) {
    case 'mentor':
      return <GraduationCap className="h-5 w-5" />
    case 'feature':
      return <Lightbulb className="h-5 w-5" />
    case 'feedback':
      return <MessageCircle className="h-5 w-5" />
    default:
      return <HelpCircle className="h-5 w-5" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="secondary">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      )
    case 'in_review':
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-600">
          <Clock className="mr-1 h-3 w-3" />
          In Review
        </Badge>
      )
    case 'approved':
      return (
        <Badge variant="outline" className="border-green-500 text-green-600">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      )
    case 'completed':
      return (
        <Badge className="bg-green-600">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      )
    case 'declined':
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Declined
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-100 dark:bg-red-900/50'
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50'
    case 'low':
      return 'text-green-600 bg-green-100 dark:bg-green-900/50'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export default async function FounderRequestsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const startupId = session.user.startupId

  if (!startupId) {
    redirect('/founder/dashboard')
  }

  return (
    <div className="flex flex-col">
      <FounderHeader
        title="Requests"
        description="Request mentor help, features, or provide feedback"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:border-blue-500 transition-colors cursor-pointer">
            <CardHeader>
              <GraduationCap className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Request a Mentor</CardTitle>
              <CardDescription>Get matched with an expert in a specific area</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-blue-500 transition-colors cursor-pointer">
            <CardHeader>
              <Lightbulb className="h-8 w-8 text-yellow-600 mb-2" />
              <CardTitle className="text-lg">Suggest a Feature</CardTitle>
              <CardDescription>Help us improve the platform for founders</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                New Suggestion
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-blue-500 transition-colors cursor-pointer">
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Give Feedback</CardTitle>
              <CardDescription>Report issues or share your thoughts</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Send Feedback
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Requests</CardTitle>
            <CardDescription>
              {mockRequests.length} requests submitted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-start gap-4 rounded-lg border p-4"
                >
                  <div className={`rounded-lg p-2 ${getPriorityColor(request.priority)}`}>
                    {getRequestTypeIcon(request.requestType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.description}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className="text-xs capitalize">
                        {request.requestType}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {request.priority} priority
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {request.responseNotes && (
                      <div className="mt-3 rounded-lg bg-muted p-3">
                        <p className="text-sm font-medium">Response:</p>
                        <p className="text-sm text-muted-foreground">{request.responseNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {mockRequests.length === 0 && (
              <div className="text-center py-10">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No requests yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the cards above to submit your first request
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
