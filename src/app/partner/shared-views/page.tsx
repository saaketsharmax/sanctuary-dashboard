'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, Eye, FileText, BarChart3, CheckSquare, Trash2 } from 'lucide-react'

const mockSharedViews = [
  { id: '1', founderName: 'Sarah Chen', startupName: 'TechFlow AI', viewType: 'metrics', isActive: true, expiresAt: '2026-03-01' },
  { id: '2', founderName: 'Sarah Chen', startupName: 'TechFlow AI', viewType: 'checkpoints', isActive: true, expiresAt: null },
  { id: '3', founderName: 'Emma Wilson', startupName: 'GreenCommute', viewType: 'documents', isActive: false, expiresAt: '2026-02-15' },
]

const viewTypeIcons: Record<string, any> = {
  metrics: BarChart3,
  checkpoints: CheckSquare,
  documents: FileText,
}

export default function SharedViewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shared Views</h1>
          <p className="text-muted-foreground mt-1">Manage what founders can see</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Shared View
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active Views</p>
            <p className="text-2xl font-bold">{mockSharedViews.filter(v => v.isActive).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Founders with Access</p>
            <p className="text-2xl font-bold">{new Set(mockSharedViews.map(v => v.founderName)).size}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Expiring Soon</p>
            <p className="text-2xl font-bold text-yellow-600">1</p>
          </CardContent>
        </Card>
      </div>

      {/* Shared Views List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Shared Views</CardTitle>
          <CardDescription>Control what data is shared with founders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSharedViews.map((view) => {
              const Icon = viewTypeIcons[view.viewType]
              return (
                <div key={view.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{view.startupName}</p>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {view.viewType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Shared with {view.founderName}
                        {view.expiresAt && ` • Expires ${view.expiresAt}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <Switch checked={view.isActive} />
                    </div>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
