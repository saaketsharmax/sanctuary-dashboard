'use client'

import { useState } from 'react'
import { PartnerHeader } from '@/components/partner/layout/partner-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Eye,
  EyeOff,
  Plus,
  Building2,
  BarChart3,
  FileText,
  CheckCircle2,
  Trash2,
  Calendar,
} from 'lucide-react'
import { getAllStartupsWithFounders } from '@/lib/mock-data'
import type { SharedViewType, SharedViewPermission } from '@/types'

// Mock shared views data
const mockSharedViews = [
  {
    id: 'sv-1',
    targetStartupId: 'startup-1',
    targetStartupName: 'TechFlow AI',
    targetFounderName: 'Sarah Chen',
    viewType: 'metrics' as SharedViewType,
    permissions: ['view', 'comment'] as SharedViewPermission[],
    expiresAt: null,
    isActive: true,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'sv-2',
    targetStartupId: 'startup-2',
    targetStartupName: 'GreenCommute',
    targetFounderName: 'Emma Johansson',
    viewType: 'checkpoint' as SharedViewType,
    permissions: ['view'] as SharedViewPermission[],
    expiresAt: '2026-03-01T00:00:00Z',
    isActive: true,
    createdAt: '2026-01-10T14:30:00Z',
  },
]

function getViewTypeIcon(type: SharedViewType) {
  switch (type) {
    case 'metrics':
      return <BarChart3 className="h-4 w-4 text-blue-600" />
    case 'checkpoint':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case 'document':
      return <FileText className="h-4 w-4 text-purple-600" />
  }
}

function getViewTypeLabel(type: SharedViewType) {
  switch (type) {
    case 'metrics':
      return 'Metrics'
    case 'checkpoint':
      return 'Checkpoints'
    case 'document':
      return 'Documents'
  }
}

export default function PartnerSharedViewsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedStartup, setSelectedStartup] = useState<string>('')
  const [selectedViewType, setSelectedViewType] = useState<SharedViewType>('metrics')

  const startups = getAllStartupsWithFounders()

  return (
    <div className="flex flex-col h-full">
      <PartnerHeader
        title="Shared Views"
        description="Manage what founders can see"
        action={{
          label: 'Create View',
          onClick: () => setShowCreateForm(!showCreateForm),
        }}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Create New Shared View */}
        {showCreateForm && (
          <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30">
            <CardHeader>
              <CardTitle className="text-lg">Create New Shared View</CardTitle>
              <CardDescription>
                Share specific metrics, checkpoints, or documents with founders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Select Startup</Label>
                  <Select value={selectedStartup} onValueChange={setSelectedStartup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a startup" />
                    </SelectTrigger>
                    <SelectContent>
                      {startups.map((startup) => (
                        <SelectItem key={startup.id} value={startup.id}>
                          {startup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>View Type</Label>
                  <Select
                    value={selectedViewType}
                    onValueChange={(v) => setSelectedViewType(v as SharedViewType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metrics">Metrics</SelectItem>
                      <SelectItem value="checkpoint">Checkpoints</SelectItem>
                      <SelectItem value="document">Documents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Switch id="perm-view" defaultChecked disabled />
                    <Label htmlFor="perm-view" className="text-sm">View</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="perm-comment" />
                    <Label htmlFor="perm-comment" className="text-sm">Comment</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="perm-download" />
                    <Label htmlFor="perm-download" className="text-sm">Download</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button disabled={!selectedStartup}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Shared View
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Shared Views */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              <CardTitle>Active Shared Views</CardTitle>
            </div>
            <CardDescription>
              Views currently accessible by founders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mockSharedViews.length > 0 ? (
              <div className="space-y-4">
                {mockSharedViews.map((view) => (
                  <div
                    key={view.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        {getViewTypeIcon(view.viewType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{view.targetStartupName}</p>
                          <Badge variant="outline">
                            {getViewTypeLabel(view.viewType)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Shared with {view.targetFounderName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Created {new Date(view.createdAt).toLocaleDateString()}
                        </div>
                        {view.expiresAt && (
                          <p className="text-yellow-600">
                            Expires {new Date(view.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Switch checked={view.isActive} />
                          <span className="text-sm text-muted-foreground">
                            {view.isActive ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <EyeOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No shared views yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a shared view to give founders access to specific data
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">About Shared Views</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Metrics:</strong> Share specific KPIs, growth charts, or benchmarks with founders.
            </p>
            <p>
              <strong>Checkpoints:</strong> Give founders visibility into their progress tracking and partner feedback.
            </p>
            <p>
              <strong>Documents:</strong> Share due diligence reports, programme materials, or other files.
            </p>
            <p>
              <strong>Permissions:</strong> Control whether founders can only view, comment, or download shared content.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
