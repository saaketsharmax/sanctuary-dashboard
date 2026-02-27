'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from '@sanctuary/ui'
import { Plus, Eye, Share2 } from 'lucide-react'

export default function SharedViewsPage() {
  // No mock data - show empty state
  const sharedViews: Array<{
    id: string
    founderName: string
    startupName: string
    viewType: string
    isActive: boolean
    expiresAt: string | null
  }> = []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shared Views</h1>
          <p className="text-muted-foreground mt-1">Manage what founders can see</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Create Shared View
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active Views</p>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Founders with Access</p>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Expiring Soon</p>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Shared Views</CardTitle>
          <CardDescription>Control what data is shared with founders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <Share2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Shared Views Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              Create shared views to give founders access to specific metrics, checkpoints, or documents.
            </p>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Shared View
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
