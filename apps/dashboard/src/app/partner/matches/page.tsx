'use client'

import {
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@sanctuary/ui'
import { GitCompare } from 'lucide-react'

export default function MatchesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mentor Matches</h1>
        <p className="text-muted-foreground mt-1">Review and manage mentor-startup matches</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-success">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending (0)</TabsTrigger>
          <TabsTrigger value="approved">Approved (0)</TabsTrigger>
          <TabsTrigger value="completed">Completed (0)</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <GitCompare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending matches</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Matches will appear here when startups request mentor help.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <GitCompare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No approved matches</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Approved matches will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <GitCompare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No completed matches</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Completed matches will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
