'use client'

import { useRouter } from 'next/navigation'
import { Building2, Users, Rocket, TrendingUp, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="font-semibold text-xl">Sanctuary</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Welcome to Sanctuary
          </h1>
          <p className="text-xl text-muted-foreground">
            The accelerator platform that connects founders with the resources,
            mentors, and partners they need to scale their startups.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Founder Card */}
          <Card
            className="relative overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => router.push('/founder/dashboard')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <Rocket className="h-7 w-7 text-blue-500" />
              </div>
              <CardTitle className="text-2xl">I'm a Founder</CardTitle>
              <CardDescription className="text-base">
                Access your startup dashboard, track progress, and connect with mentors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Manage your company profile
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Track milestones and progress
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Request mentor support
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Upload documents and pitch decks
                </li>
              </ul>
              <Button className="w-full group-hover:bg-blue-600" size="lg">
                Enter Founder Portal
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Partner Card */}
          <Card
            className="relative overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => router.push('/partner/dashboard')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-7 w-7 text-emerald-500" />
              </div>
              <CardTitle className="text-2xl">I'm a Partner</CardTitle>
              <CardDescription className="text-base">
                Manage your portfolio, review applications, and match mentors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  View portfolio performance
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Review startup applications
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Manage mentor matching
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Track portfolio metrics
                </li>
              </ul>
              <Button className="w-full group-hover:bg-emerald-600" variant="default" size="lg">
                Enter Partner Portal
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
          <div>
            <p className="text-3xl font-bold">50+</p>
            <p className="text-sm text-muted-foreground">Startups Accelerated</p>
          </div>
          <div>
            <p className="text-3xl font-bold">$25M+</p>
            <p className="text-sm text-muted-foreground">Portfolio MRR</p>
          </div>
          <div>
            <p className="text-3xl font-bold">30+</p>
            <p className="text-sm text-muted-foreground">Expert Mentors</p>
          </div>
          <div>
            <p className="text-3xl font-bold">95%</p>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Sanctuary. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
