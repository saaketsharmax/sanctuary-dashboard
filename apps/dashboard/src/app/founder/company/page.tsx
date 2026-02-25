'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Badge,
  Skeleton,
  Toaster,
} from '@sanctuary/ui'
import { Building2, Globe, MapPin, Calendar, Save, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
interface CompanyData {
  id: string
  name: string
  oneLiner: string
  description: string
  website: string
  industry: string
  stage: string
  location: string
  founded: string
  problem: string
  solution: string
  targetCustomer?: string
  cohort?: string
  status?: string
  metrics?: {
    users: number
    mrr: number
    retention?: number
    nps?: number
  }
}

export default function CompanyPage() {
  const [formData, setFormData] = useState<CompanyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isMock, setIsMock] = useState(false)

  useEffect(() => {
    fetchCompanyData()
  }, [])

  const fetchCompanyData = async () => {
    try {
      const res = await fetch('/api/founder/company')
      const data = await res.json()
      if (data.company) {
        setFormData(data.company)
        setIsMock(data.isMock)
      }
    } catch (error) {
      console.error('Failed to fetch company data:', error)
      toast.error('Failed to load company data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData) return

    setIsSaving(true)
    try {
      const res = await fetch('/api/founder/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Company profile updated')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save changes')
      }
    } catch (error) {
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
            <Skeleton className="h-10" />
            <Skeleton className="h-24" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No company data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your company information
            {isMock && <Badge variant="outline" className="ml-2 text-xs">Demo Mode</Badge>}
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
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
                  value={formData.website || ''}
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
              value={formData.oneLiner || ''}
              onChange={(e) => setFormData({ ...formData, oneLiner: e.target.value })}
              placeholder="Describe your company in one sentence"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry || ''}
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
                  value={formData.location || ''}
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
                  value={formData.founded || ''}
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
              value={formData.problem || ''}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              rows={3}
              placeholder="Describe the problem you're solving"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="solution">Your Solution</Label>
            <Textarea
              id="solution"
              value={formData.solution || ''}
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
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="secondary" className="text-sm py-1 px-3">
              {formData.stage?.replace(/_/g, ' ') || 'Not Started'}
            </Badge>
            {formData.cohort && (
              <span className="text-sm text-muted-foreground">
                {formData.cohort}
              </span>
            )}
            {formData.status && (
              <Badge variant="outline" className="text-sm">
                {formData.status}
              </Badge>
            )}
          </div>
          {formData.metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Users</p>
                <p className="text-xl font-semibold">{formData.metrics.users.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">MRR</p>
                <p className="text-xl font-semibold">${formData.metrics.mrr.toLocaleString()}</p>
              </div>
              {formData.metrics.retention !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">Retention</p>
                  <p className="text-xl font-semibold">{formData.metrics.retention}%</p>
                </div>
              )}
              {formData.metrics.nps !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">NPS</p>
                  <p className="text-xl font-semibold">{formData.metrics.nps}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}
