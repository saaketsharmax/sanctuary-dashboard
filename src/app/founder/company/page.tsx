'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Building2, Globe, MapPin, Calendar, Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

const companyData = {
  name: 'TechFlow AI',
  oneLiner: 'AI-powered workflow automation for SMBs',
  description: 'TechFlow AI helps small and medium businesses automate their repetitive workflows using artificial intelligence. Our platform learns from user behavior and suggests optimizations that save hours of manual work each week.',
  website: 'https://techflow.ai',
  industry: 'AI/ML',
  stage: 'Solution Shaping',
  location: 'San Francisco, CA',
  founded: '2025',
  problem: 'SMBs waste 20+ hours per week on repetitive tasks that could be automated, but existing solutions are too expensive or complex.',
  solution: 'An AI assistant that observes workflows and automatically suggests and implements automations, requiring no technical expertise.',
}

export default function CompanyPage() {
  const [formData, setFormData] = useState(companyData)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success('Company profile updated')
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your company information</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="flex">
                <span className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                </span>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="rounded-l-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="oneLiner">One-liner</Label>
            <Input
              id="oneLiner"
              value={formData.oneLiner}
              onChange={(e) => setFormData({ ...formData, oneLiner: e.target.value })}
              placeholder="Describe your company in one sentence"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex">
                <span className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                </span>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="rounded-l-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="founded">Founded</Label>
              <div className="flex">
                <span className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                </span>
                <Input
                  id="founded"
                  value={formData.founded}
                  onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                  className="rounded-l-none"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problem & Solution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Problem & Solution</CardTitle>
          <CardDescription>What problem are you solving and how?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="problem">The Problem</Label>
            <Textarea
              id="problem"
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              rows={3}
              placeholder="Describe the problem you're solving"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="solution">Your Solution</Label>
            <Textarea
              id="solution"
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              rows={3}
              placeholder="Describe how you solve this problem"
            />
          </div>
        </CardContent>
      </Card>

      {/* Programme Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Programme Status</CardTitle>
          <CardDescription>Your current stage in the Sanctuary programme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm py-1 px-3">
              {formData.stage}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Week 6 of 20
            </span>
          </div>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}
