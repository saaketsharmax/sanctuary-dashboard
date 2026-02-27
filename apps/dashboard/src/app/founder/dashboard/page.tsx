'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OSLayout } from '@/components/os/os-layout'
import { HomeScreen } from '@/components/os/home-screen'
import { ChatWidget } from '@/components/chat/ChatWidget'
import {
  FileText,
  CheckSquare,
  TrendingUp,
  MessageSquare,
  Users,
  BarChart,
  Building2,
  DollarSign,
  Loader2,
} from 'lucide-react'
import type { NavSection } from '@/components/os/os-layout'

interface Application {
  id: string
  company_name: string
  status: string
  submitted_at: string | null
  interview_completed_at: string | null
  assessment_completed_at: string | null
  review_decision: string | null
  reviewed_at: string | null
  created_at: string
}

export default function FounderDashboard() {
  const router = useRouter()
  const [activeWindow, setActiveWindow] = useState<NavSection | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/applications')
        if (res.ok) {
          const data = await res.json()
          setApplications(data.applications || [])
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query)
  }

  const handleQueryProcessed = () => {
    setSearchQuery('')
  }

  // Navigate to real routes when quick actions are clicked
  const founderQuickActions = [
    { label: 'View my progress', onClick: () => router.push('/founder/progress') },
    { label: 'Update company profile', onClick: () => router.push('/founder/company') },
    { label: 'View metrics', onClick: () => router.push('/founder/metrics') },
    { label: 'Investment tracking', onClick: () => router.push('/founder/investment') },
    { label: 'Upload documents', onClick: () => router.push('/founder/documents') },
  ]

  // No application yet — add apply action
  if (!loading && applications.length === 0) {
    founderQuickActions.unshift({
      label: 'Apply to Sanctuary',
      onClick: () => router.push('/founder/apply'),
    })
  }

  // Build recent sections from real data
  const app = applications[0]
  const statusText = app
    ? app.review_decision === 'approve'
      ? 'Accepted'
      : app.review_decision === 'reject'
      ? 'Not Selected'
      : app.status === 'interview_completed'
      ? 'Interview Complete'
      : app.status === 'assessment_generated'
      ? 'Under Review'
      : 'Submitted'
    : null

  const founderRecentSections = [
    {
      title: 'Recent Documents',
      helpText: 'Your recently accessed files',
      cards: [
        {
          id: '1',
          title: 'Pitch Deck',
          subtitle: 'Upload or update',
          icon: <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-red-600" /></div>,
          onClick: () => router.push('/founder/documents'),
        },
        {
          id: '2',
          title: 'Financial Model',
          subtitle: 'View documents',
          icon: <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><BarChart className="w-5 h-5 text-green-600" /></div>,
          onClick: () => router.push('/founder/documents'),
        },
        {
          id: '3',
          title: 'Company Profile',
          subtitle: 'Edit details',
          icon: <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-blue-600" /></div>,
          onClick: () => router.push('/founder/company'),
        },
      ],
    },
    {
      title: app ? 'Application Status' : 'Get started',
      cards: app
        ? [
            {
              id: '1',
              title: app.company_name,
              subtitle: statusText || app.status,
              icon: <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><CheckSquare className="w-5 h-5 text-purple-600" /></div>,
              onClick: () => router.push('/founder/progress'),
            },
            {
              id: '2',
              title: 'Investment',
              subtitle: 'Track cash & credits',
              icon: <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5 text-green-600" /></div>,
              onClick: () => router.push('/founder/investment'),
            },
            {
              id: '3',
              title: 'Requests',
              subtitle: 'View your requests',
              icon: <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"><MessageSquare className="w-5 h-5 text-yellow-600" /></div>,
              onClick: () => router.push('/founder/requests'),
            },
          ]
        : [
            {
              id: '1',
              title: 'Apply to Sanctuary',
              subtitle: 'Start your application',
              icon: <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-purple-600" /></div>,
              onClick: () => router.push('/founder/apply'),
            },
            {
              id: '2',
              title: 'Company Profile',
              subtitle: 'Set up your profile',
              icon: <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-yellow-600" /></div>,
              onClick: () => router.push('/founder/company'),
            },
            {
              id: '3',
              title: 'Documents',
              subtitle: 'Upload pitch deck',
              icon: <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-cyan-600" /></div>,
              onClick: () => router.push('/founder/documents'),
            },
          ],
    },
    {
      title: 'Quick Links',
      cards: [
        {
          id: '1',
          title: 'Metrics',
          subtitle: 'View your KPIs',
          icon: <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"><BarChart className="w-5 h-5 text-indigo-600" /></div>,
          onClick: () => router.push('/founder/metrics'),
        },
        {
          id: '2',
          title: 'Progress',
          subtitle: 'Track milestones',
          icon: <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center"><CheckSquare className="w-5 h-5 text-pink-600" /></div>,
          onClick: () => router.push('/founder/progress'),
        },
        {
          id: '3',
          title: 'Settings',
          subtitle: 'Account settings',
          icon: <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-teal-600" /></div>,
          onClick: () => router.push('/founder/settings'),
        },
      ],
    },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <OSLayout
      backgroundImage="/assets/wallpapers/wallpaper-bg.jpg"
      role="founder"
      activeWindow={activeWindow}
      onWindowChange={setActiveWindow}
    >
      <HomeScreen
        userName={app?.company_name?.split(' ')[0] || 'Founder'}
        greeting="Good morning"
        placeholder="Ask me anything about your startup journey..."
        quickActions={founderQuickActions}
        recentSections={founderRecentSections}
        onSearchSubmit={handleSearchSubmit}
      />
      {/* AI Chat Widget - only show on home screen */}
      {!activeWindow && (
        <ChatWidget
          externalQuery={searchQuery}
          onQueryProcessed={handleQueryProcessed}
        />
      )}
    </OSLayout>
  )
}
