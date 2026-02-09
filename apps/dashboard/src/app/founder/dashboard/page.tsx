'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Building2,
  FileText,
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

export default function FounderDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome to Sanctuary</h1>
        <p className="text-muted-foreground mt-1">
          Your startup journey starts here
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Company</span>
            </div>
            <p className="text-lg font-semibold mt-1">Not set up</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Stage</span>
            </div>
            <p className="text-lg font-semibold mt-1">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Documents</span>
            </div>
            <p className="text-lg font-semibold mt-1">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Progress</span>
            </div>
            <p className="text-lg font-semibold mt-1">0%</p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>Complete these steps to set up your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/founder/apply">
            <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Submit Application</p>
                  <p className="text-sm text-muted-foreground">Tell us about your startup</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>

          <div className="flex items-center justify-between p-4 rounded-lg border opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm font-semibold text-muted-foreground">2</span>
              </div>
              <div>
                <p className="font-medium">Complete Interview</p>
                <p className="text-sm text-muted-foreground">AI-powered interview process</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm font-semibold text-muted-foreground">3</span>
              </div>
              <div>
                <p className="font-medium">Get Accepted</p>
                <p className="text-sm text-muted-foreground">Join the Sanctuary program</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/founder/apply">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="font-medium">Apply Now</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/founder/company">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Building2 className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="font-medium">Company Profile</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/founder/documents">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="font-medium">Documents</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
