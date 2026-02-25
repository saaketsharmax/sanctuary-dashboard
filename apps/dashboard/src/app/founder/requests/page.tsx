'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Skeleton,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Toaster,
} from '@sanctuary/ui'
import { Plus, MessageSquare, Users, Lightbulb, HelpCircle, Loader2, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
interface Request {
  id: string
  type: string
  title: string
  description: string | null
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  assignedTo: string | null
  resolutionNotes: string | null
  resolvedAt: string | null
}

const requestTypes: Record<string, { label: string; icon: any; color: string; description: string }> = {
  mentor: { label: 'Mentor Request', icon: Users, color: 'bg-info/15 text-info', description: 'Request a mentor match' },
  intro: { label: 'Introduction', icon: Users, color: 'bg-indigo-100 text-indigo-700', description: 'Request an introduction' },
  feature: { label: 'Feature Request', icon: Lightbulb, color: 'bg-purple-100 text-purple-700', description: 'Suggest a new feature' },
  feedback: { label: 'Feedback', icon: MessageSquare, color: 'bg-success/15 text-success', description: 'Request feedback' },
  other: { label: 'Other', icon: HelpCircle, color: 'bg-muted text-foreground', description: 'Other requests' },
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/15 text-warning',
  in_progress: 'bg-info/15 text-info',
  in_review: 'bg-info/15 text-info',
  approved: 'bg-success/15 text-success',
  completed: 'bg-success/15 text-success',
  declined: 'bg-destructive/15 text-destructive',
  cancelled: 'bg-muted text-foreground',
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newRequest, setNewRequest] = useState({
    type: 'mentor',
    title: '',
    description: '',
    priority: 'normal',
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/founder/requests')
      const data = await res.json()
      if (data.requests) {
        setRequests(data.requests)
        setIsMock(data.isMock)
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error)
      toast.error('Failed to load requests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!newRequest.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/founder/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Request submitted')
        setRequests([data.request, ...requests])
        setIsDialogOpen(false)
        setNewRequest({ type: 'mentor', title: '', description: '', priority: 'normal' })
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit request')
      }
    } catch (error) {
      toast.error('Failed to submit request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return

    try {
      const res = await fetch('/api/founder/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'cancel' }),
      })

      if (res.ok) {
        toast.success('Request cancelled')
        setRequests(requests.map(r =>
          r.id === requestId ? { ...r, status: 'cancelled' } : r
        ))
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to cancel request')
      }
    } catch (error) {
      toast.error('Failed to cancel request')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-8 mb-2" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Requests</h1>
          <p className="text-muted-foreground mt-1">
            Request mentors, features, or support
            {isMock && <Badge variant="outline" className="ml-2 text-xs">Demo Mode</Badge>}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isMock}>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Request</DialogTitle>
              <DialogDescription>
                Submit a request to your programme partners
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Request Type</Label>
                <Select
                  value={newRequest.type}
                  onValueChange={(value) => setNewRequest({ ...newRequest, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(requestTypes).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="Brief description of your request"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Details (optional)</Label>
                <Textarea
                  id="description"
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Provide more details about your request..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newRequest.priority}
                  onValueChange={(value) => setNewRequest({ ...newRequest, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Request Type Cards */}
      <div className="grid md:grid-cols-5 gap-4">
        {Object.entries(requestTypes).map(([key, { label, icon: Icon, description }]) => (
          <Card
            key={key}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => {
              if (!isMock) {
                setNewRequest({ ...newRequest, type: key })
                setIsDialogOpen(true)
              }
            }}
          >
            <CardContent className="pt-6">
              <Icon className="h-8 w-8 text-primary mb-2" />
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Requests</CardTitle>
          <CardDescription>Track the status of your requests</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No requests yet</p>
              <p className="text-sm mt-1">Submit your first request to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const typeInfo = requestTypes[request.type] || requestTypes.other
                const Icon = typeInfo.icon
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className={`text-xs ${typeInfo.color}`}>
                            {typeInfo.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(request.createdAt)}</span>
                          {request.assignedTo && (
                            <span className="text-xs text-muted-foreground">• {request.assignedTo}</span>
                          )}
                        </div>
                        {request.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{request.description}</p>
                        )}
                        {request.resolutionNotes && (
                          <p className="text-sm text-success mt-2">Resolution: {request.resolutionNotes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {request.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs">High Priority</Badge>
                      )}
                      <Badge className={`text-xs ${statusColors[request.status] || statusColors.pending}`}>
                        {request.status.replace(/_/g, ' ')}
                      </Badge>
                      {request.status === 'pending' && !isMock && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleCancel(request.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}
