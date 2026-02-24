'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OSLayout } from '@/components/os/os-layout'
import { HomeScreen } from '@/components/os/home-screen'
import { ChatWidget } from '@/components/chat/ChatWidget'
import {
  FileText,
  Users,
  TrendingUp,
  AlertCircle,
  Calendar,
  Briefcase,
  FileCheck,
  DollarSign,
  Loader2,
} from 'lucide-react'
import type { NavSection } from '@/components/os/os-layout'

interface Application {
  id: string
  status: string
  companyName: string
  companyOneLiner: string
}

export default function PartnerDashboard() {
  const router = useRouter()
  const [activeWindow, setActiveWindow] = useState<NavSection | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
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

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query)
  }

  const handleQueryProcessed = () => {
    setSearchQuery('')
  }

  const pendingApplications = applications.filter(
    app => app.status === 'assessment_generated' || app.status === 'under_review' || app.status === 'interview_completed'
  )

  // Navigate to real routes
  const partnerQuickActions = [
    { label: 'Review applications', onClick: () => router.push('/partner/applications') },
    { label: 'Check portfolio', onClick: () => router.push('/partner/portfolio') },
    { label: 'View investments', onClick: () => router.push('/partner/investments') },
    { label: 'View metrics', onClick: () => router.push('/partner/metrics') },
    { label: 'Mentor matching', onClick: () => router.push('/partner/mentors') },
  ]

  // Build recent sections from real data where available
  const partnerRecentSections = [
    {
      title: 'Jump back in to your portfolio',
      helpText: 'Recently viewed startups',
      cards: applications.length > 0
        ? applications.slice(0, 3).map((app, i) => ({
            id: app.id,
            title: app.companyName,
            subtitle: app.companyOneLiner || app.status,
            icon: (
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold ${
                i === 0 ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                : i === 1 ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : 'bg-gradient-to-br from-red-500 to-pink-600'
              }`}>
                {app.companyName.charAt(0)}
              </div>
            ),
            onClick: () => router.push(`/partner/applications/${app.id}`),
          }))
        : [
            {
              id: '1',
              title: 'No applications yet',
              subtitle: 'Applications will appear here',
              icon: <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center"><FileCheck className="w-5 h-5 text-muted-foreground" /></div>,
              onClick: () => router.push('/partner/applications'),
            },
          ],
    },
    {
      title: 'Quick actions',
      cards: [
        {
          id: '1',
          title: 'Pending Applications',
          subtitle: `${pendingApplications.length} need review`,
          icon: <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-orange-600" /></div>,
          onClick: () => router.push('/partner/applications'),
        },
        {
          id: '2',
          title: 'Portfolio Analytics',
          subtitle: 'View insights',
          icon: <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-blue-600" /></div>,
          onClick: () => router.push('/partner/metrics'),
        },
        {
          id: '3',
          title: 'Investments',
          subtitle: 'Track portfolio',
          icon: <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5 text-green-600" /></div>,
          onClick: () => router.push('/partner/investments'),
        },
      ],
    },
    {
      title: 'More tools',
      cards: [
        {
          id: '1',
          title: 'Mentor Matching',
          subtitle: 'Connect experts',
          icon: <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-purple-600" /></div>,
          onClick: () => router.push('/partner/mentors'),
        },
        {
          id: '2',
          title: 'Shared Views',
          subtitle: 'Collaborate',
          icon: <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"><Briefcase className="w-5 h-5 text-indigo-600" /></div>,
          onClick: () => router.push('/partner/shared-views'),
        },
        {
          id: '3',
          title: 'Settings',
          subtitle: 'Account settings',
          icon: <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-gray-600" /></div>,
          onClick: () => router.push('/partner/settings'),
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
      role="partner"
      activeWindow={activeWindow}
      onWindowChange={setActiveWindow}
    >
      <HomeScreen
        userName="Partner"
        greeting="Good morning"
        placeholder="Ask about your portfolio, applications, or startups..."
        quickActions={partnerQuickActions}
        recentSections={partnerRecentSections}
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
