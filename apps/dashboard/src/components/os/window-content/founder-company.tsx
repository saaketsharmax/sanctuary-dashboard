'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, DollarSign, Users, Target, MoreVertical, Calendar, MapPin, Globe, Building2, MessageSquare, FileText, CheckCircle } from 'lucide-react'
const companyInfo = {
  name: 'TechFlow AI',
  logo: 'T',
  description: 'AI-powered workflow automation for SMBs',
  industry: 'B2B SaaS',
  stage: 'Solution Shaping',
  cohort: '2026-A',
  bgColor: 'from-blue-500 to-purple-600',
  website: 'techflow.ai',
  location: 'San Francisco, CA',
  founded: 'January 2025',
  teamSize: 4
}

const stats = [
  {
    label: 'MRR',
    value: '$12.5K',
    change: '+12%',
    trend: 'up',
    icon: DollarSign,
    color: 'green'
  },
  {
    label: 'Users',
    value: '342',
    change: '+8%',
    trend: 'up',
    icon: Users,
    color: 'blue'
  },
  {
    label: 'Growth Rate',
    value: '18%',
    change: '+3%',
    trend: 'up',
    icon: TrendingUp,
    color: 'purple'
  }
]

const teamMembers = [
  { id: '1', name: 'Sarah Chen', role: 'CEO & Founder' },
  { id: '2', name: 'Michael Rodriguez', role: 'CTO' },
  { id: '3', name: 'Emma Thompson', role: 'Head of Product' },
  { id: '4', name: 'James Liu', role: 'Lead Engineer' },
]

const activities = [
  {
    id: '1',
    type: 'milestone',
    title: 'Hit $10K MRR milestone',
    description: 'Reached our first revenue milestone',
    timestamp: '2 days ago',
    icon: Target,
    color: 'green'
  },
  {
    id: '2',
    type: 'update',
    title: 'Updated pitch deck',
    description: 'Uploaded new version with Q1 metrics',
    timestamp: '3 days ago',
    icon: FileText,
    color: 'blue'
  },
  {
    id: '3',
    type: 'meeting',
    title: 'Weekly sync with Sanctuary',
    description: 'Discussed go-to-market strategy',
    timestamp: '1 week ago',
    icon: MessageSquare,
    color: 'purple'
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Completed user research phase',
    description: '25 interviews with target customers',
    timestamp: '1 week ago',
    icon: CheckCircle,
    color: 'green'
  },
  {
    id: '5',
    type: 'milestone',
    title: 'First paying customer',
    description: 'Onboarded our first enterprise client',
    timestamp: '2 weeks ago',
    icon: Users,
    color: 'blue'
  },
]

export function FounderCompanyContent() {
  return (
    <div className="h-full flex bg-background">
      {/* Left Sidebar - Company Details */}
      <aside className="w-[380px] flex-shrink-0 border-r border-border/30 overflow-y-auto">
        <div className="p-8 space-y-6">
          {/* Company Overview */}
          <div>
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${companyInfo.bgColor} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
                {companyInfo.logo}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-foreground mb-1">{companyInfo.name}</h2>
                <p className="text-sm text-muted-foreground mb-3">{companyInfo.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{companyInfo.industry}</Badge>
              <Badge>{companyInfo.stage}</Badge>
              <Badge>{companyInfo.cohort}</Badge>
            </div>
          </div>

          {/* Company Info */}
          <div className="space-y-4 pt-4 border-t border-border/30">
            <div className="flex items-start gap-3">
              <Globe className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Website</p>
                <p className="text-sm text-foreground font-medium">{companyInfo.website}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                <p className="text-sm text-foreground font-medium">{companyInfo.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Founded</p>
                <p className="text-sm text-foreground font-medium">{companyInfo.founded}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Team Size</p>
                <p className="text-sm text-foreground font-medium">{companyInfo.teamSize} people</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4 pt-4 border-t border-border/30">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Metrics</h3>
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-${stat.color}-100 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 text-${stat.color}-600`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                  <p className={`text-xs font-medium text-${stat.color}-600`}>{stat.change}</p>
                </div>
              )
            })}
          </div>

          {/* Team */}
          <div className="pt-4 border-t border-border/30">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Team</h3>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Right Panel - Activity Feed */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 bg-card border-b border-border/30">
          <h1 className="text-lg font-semibold text-foreground">Activity Feed</h1>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-3xl space-y-6">
            {activities.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-${activity.color}-100 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 text-${activity.color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0 pb-6 border-b border-border/30 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-semibold text-foreground">{activity.title}</h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-4">{activity.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
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
