'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Rocket, TrendingUp, ArrowRight, Play } from 'lucide-react'
export default function LandingPage() {
  const router = useRouter()

  const handleFounderClick = () => {
    router.push('/auth/signup')
  }

  const handlePartnerClick = () => {
    router.push('/auth/signup')
  }

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
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Play className="h-3 w-3" />
            AI-Powered Accelerator
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Welcome to Sanctuary
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            The accelerator platform that connects founders with the resources,
            mentors, and partners they need to scale their startups.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Apply Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Founder Card */}
          <Card
            className="relative overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
            onClick={handleFounderClick}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Rocket className="h-7 w-7 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">I&apos;m a Founder</CardTitle>
              <CardDescription className="text-base">
                Apply to join the accelerator, get mentorship, and scale your startup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  AI-powered interview process
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Get matched with expert mentors
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Track milestones and progress
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Access investor network
                </li>
              </ul>
              <Button className="w-full group-hover:bg-blue-500" size="lg">
                Apply as Founder
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Partner Card */}
          <Card
            className="relative overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
            onClick={handlePartnerClick}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                <TrendingUp className="h-7 w-7 text-green-600" />
              </div>
              <CardTitle className="text-2xl">I&apos;m a Partner</CardTitle>
              <CardDescription className="text-base">
                Mentor startups, invest in portfolio companies, or manage the program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Review AI-assessed applications
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Intelligent mentor-startup matching
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Real-time portfolio metrics
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Automated startup insights
                </li>
              </ul>
              <Button className="w-full group-hover:bg-green-500" variant="default" size="lg">
                Join as Partner
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
