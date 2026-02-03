'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, MessageSquare, Users, Lightbulb, HelpCircle } from 'lucide-react'

const mockRequests = [
  { id: '1', type: 'mentor', title: 'Need help with fundraising strategy', status: 'pending', priority: 'high', createdAt: '2026-01-30' },
  { id: '2', type: 'feature', title: 'Request for investor intro dashboard', status: 'in_review', priority: 'medium', createdAt: '2026-01-25' },
  { id: '3', type: 'feedback', title: 'Pitch deck review', status: 'completed', priority: 'medium', createdAt: '2026-01-20' },
]

const requestTypes: Record<string, { label: string; icon: any; color: string }> = {
  mentor: { label: 'Mentor Request', icon: Users, color: 'bg-blue-100 text-blue-700' },
  feature: { label: 'Feature Request', icon: Lightbulb, color: 'bg-purple-100 text-purple-700' },
  feedback: { label: 'Feedback', icon: MessageSquare, color: 'bg-green-100 text-green-700' },
  other: { label: 'Other', icon: HelpCircle, color: 'bg-gray-100 text-gray-700' },
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
}

export default function RequestsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Requests</h1>
          <p className="text-muted-foreground mt-1">Request mentors, features, or support</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Request Type Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {Object.entries(requestTypes).map(([key, { label, icon: Icon, color }]) => (
          <Card key={key} className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <Icon className="h-8 w-8 text-primary mb-2" />
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {key === 'mentor' && 'Request a mentor match'}
                {key === 'feature' && 'Suggest a new feature'}
                {key === 'feedback' && 'Request feedback'}
                {key === 'other' && 'Other requests'}
              </p>
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
          <div className="space-y-4">
            {mockRequests.map((request) => {
              const typeInfo = requestTypes[request.type]
              return (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <typeInfo.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{request.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={`text-xs ${typeInfo.color}`}>
                          {typeInfo.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{request.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {request.priority === 'high' && (
                      <Badge variant="destructive" className="text-xs">High Priority</Badge>
                    )}
                    <Badge className={`text-xs ${statusColors[request.status]}`}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
