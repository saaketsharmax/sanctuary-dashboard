'use client'

import { FileText, Clock, CheckCircle2, XCircle, Eye, MoreVertical, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const applications = [
  {
    id: '1',
    company: 'DataFlow Analytics',
    description: 'B2B SaaS analytics platform for enterprise teams',
    founder: 'Sarah Johnson',
    status: 'needs_review',
    score: null,
    submittedAt: '2 days ago',
  },
  {
    id: '2',
    company: 'GreenTech Solutions',
    description: 'Sustainability tracking for enterprises',
    founder: 'Michael Chen',
    status: 'interview_complete',
    score: 82,
    submittedAt: '5 days ago',
  },
  {
    id: '3',
    company: 'HealthHub',
    description: 'Telehealth platform for rural areas',
    founder: 'Emma Rodriguez',
    status: 'under_review',
    score: 75,
    submittedAt: '1 week ago',
  },
  {
    id: '4',
    company: 'EduTech Pro',
    description: 'Online learning platform for K-12',
    founder: 'James Wilson',
    status: 'accepted',
    score: 88,
    submittedAt: '2 weeks ago',
  },
]

const statusConfig = {
  needs_review: { label: 'Needs Review', icon: Clock, color: 'text-yellow-600' },
  interview_complete: { label: 'Interview Complete', icon: FileText, color: 'text-blue-600' },
  under_review: { label: 'Under Review', icon: Eye, color: 'text-purple-600' },
  accepted: { label: 'Accepted', icon: CheckCircle2, color: 'text-green-600' },
  declined: { label: 'Declined', icon: XCircle, color: 'text-red-600' },
}

export function PartnerApplicationsContent() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-8 py-5 bg-card border-b border-border/30">
        <h1 className="text-lg font-semibold text-foreground">Applications</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-6 space-y-6">
          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-border/30 pb-0">
            <Button
              variant="ghost"
              size="sm"
              className="border-b-2 border-primary rounded-none px-4"
            >
              All ({applications.length})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="border-b-2 border-transparent rounded-none px-4 hover:border-border/30"
            >
              Needs Review (1)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="border-b-2 border-transparent rounded-none px-4 hover:border-border/30"
            >
              In Progress (2)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="border-b-2 border-transparent rounded-none px-4 hover:border-border/30"
            >
              Decided (1)
            </Button>
          </div>

          {/* Applications List */}
          <div className="space-y-0">
            {applications.map((app, index) => {
              const StatusIcon = statusConfig[app.status as keyof typeof statusConfig].icon
              const statusColor = statusConfig[app.status as keyof typeof statusConfig].color

              return (
                <div
                  key={app.id}
                  className={`py-5 hover:bg-muted/50 transition-colors cursor-pointer group ${
                    index !== applications.length - 1 ? 'border-b border-border/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground mb-1">{app.company}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{app.description}</p>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <User className="w-3.5 h-3.5" />
                        <span>{app.founder}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <div className={`flex items-center gap-1.5 text-sm ${statusColor}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span>{statusConfig[app.status as keyof typeof statusConfig].label}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Submitted {app.submittedAt}</span>
                      {app.score && (
                        <span className="font-semibold text-foreground">
                          Score: {app.score}/100
                        </span>
                      )}
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Review Application
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
