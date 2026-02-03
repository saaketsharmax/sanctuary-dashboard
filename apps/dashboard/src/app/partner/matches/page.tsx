'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, X, Send, ArrowRight } from 'lucide-react'
import { getAllMatchesWithNames, getPendingMatchesWithNames } from '@/lib/mock-data'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  intro_sent: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-700',
}

export default function MatchesPage() {
  const allMatches = getAllMatchesWithNames()
  const pendingMatches = getPendingMatchesWithNames()
  const approvedMatches = allMatches.filter(m => m.status === 'approved' || m.status === 'intro_sent')
  const completedMatches = allMatches.filter(m => m.status === 'completed')

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
            <p className="text-2xl font-bold text-yellow-600">{pendingMatches.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">{approvedMatches.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">{completedMatches.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{allMatches.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingMatches.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedMatches.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedMatches.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <MatchList matches={pendingMatches} showActions />
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <MatchList matches={approvedMatches} />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <MatchList matches={completedMatches} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MatchList({ matches, showActions = false }: { matches: any[], showActions?: boolean }) {
  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No matches in this category
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Card key={match.id}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Mentor */}
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{match.mentorName?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{match.mentorName}</p>
                    <p className="text-xs text-muted-foreground">Mentor</p>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground" />

                {/* Startup */}
                <div>
                  <p className="font-medium">{match.startupName}</p>
                  <p className="text-xs text-muted-foreground">{match.bottleneckType?.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <Badge className="text-lg px-3">{match.score}%</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{match.confidence} confidence</p>
                </div>

                <Badge className={statusColors[match.status]}>
                  {match.status.replace('_', ' ')}
                </Badge>

                {showActions && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline">
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}

                {match.status === 'approved' && (
                  <Button size="sm">
                    <Send className="h-4 w-4 mr-1" />
                    Send Intro
                  </Button>
                )}

                <Link href={`/partner/matches/${match.id}`}>
                  <Button size="sm" variant="ghost">View</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
