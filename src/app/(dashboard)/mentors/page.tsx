'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Users,
  Handshake,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Plus,
  Building2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MentorCard, ExpertiseBadge } from '@/components/mentors'
import { MatchCard } from '@/components/matching'
import {
  getActiveMentors,
  bottlenecks,
  matches,
  getMatchWithDetails,
  getMatchStats,
  startups,
  getMentorById,
} from '@/lib/mock-data'
import { PROBLEM_ARCHETYPES, getStageInfo } from '@/types'

export default function MentorMatchingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expertiseFilter, setExpertiseFilter] = useState<string>('all')

  const mentors = getActiveMentors()
  const stats = getMatchStats()

  // Startups needing help (have bottlenecks)
  const startupsNeedingHelp = bottlenecks.map((b) => {
    const startup = startups.find((s) => s.id === b.startupId)
    return { bottleneck: b, startup }
  }).filter((item) => item.startup)

  // Recent/pending matches
  const pendingMatches = matches
    .filter((m) => m.status === 'pending')
    .slice(0, 5)
    .map((m) => getMatchWithDetails(m.id))
    .filter((m) => m !== undefined)

  // Mentors available for investment
  const investorMentors = mentors.filter((m) => m.availableForInvestment)

  // Filter mentors
  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      searchQuery === '' ||
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.bio.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesExpertise =
      expertiseFilter === 'all' || mentor.expertise.includes(expertiseFilter as any)

    return matchesSearch && matchesExpertise
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mentor Startup Match Making</h1>
          <p className="text-muted-foreground">
            Connect founders with mentors who've solved similar problems
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Mentor
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Mentors</span>
            </div>
            <p className="text-2xl font-bold mt-1">{mentors.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-muted-foreground">Needs Help</span>
            </div>
            <p className="text-2xl font-bold mt-1">{startupsNeedingHelp.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Handshake className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.completed + stats.introsSent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-muted-foreground">Investors</span>
            </div>
            <p className="text-2xl font-bold mt-1">{investorMentors.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="mentors">Mentors ({mentors.length})</TabsTrigger>
          <TabsTrigger value="matches">Matches ({stats.total})</TabsTrigger>
          <TabsTrigger value="needs">Startups Needing Help ({startupsNeedingHelp.length})</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Startups Needing Help */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  Startups Needing Mentor Help
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {startupsNeedingHelp.slice(0, 4).map(({ bottleneck, startup }) => (
                  <Link
                    key={bottleneck.id}
                    href={`/startup/${startup!.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{startup!.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {bottleneck.rawBlocker.slice(0, 60)}...
                        </p>
                      </div>
                    </div>
                    <ExpertiseBadge archetype={bottleneck.problemArchetype} size="sm" />
                  </Link>
                ))}
                {startupsNeedingHelp.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No startups currently need help
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pending Matches */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Handshake className="h-4 w-4 text-purple-600" />
                  Pending Matches to Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingMatches.slice(0, 3).map((match) => {
                  const mentor = getMentorById(match.mentorId)
                  const isInvestor = mentor?.investedStartupIds.includes(match.startup.id)
                  return (
                    <Link
                      key={match.id}
                      href={`/match/${match.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                          {match.score}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{match.mentor.name}</p>
                            {isInvestor && (
                              <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700">
                                Investor
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            → {match.startup.name}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{match.confidence}</Badge>
                    </Link>
                  )
                })}
                {pendingMatches.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No pending matches
                  </p>
                )}
                {pendingMatches.length > 0 && (
                  <Link href="/matches">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View All Matches
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mentor-Investors */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Mentors Available to Invest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {investorMentors.slice(0, 4).map((mentor) => {
                  const initials = mentor.name.split(' ').map((n) => n[0]).join('').toUpperCase()
                  return (
                    <Link
                      key={mentor.id}
                      href={`/mentors/${mentor.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={mentor.photoUrl || undefined} />
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{mentor.name}</p>
                        <p className="text-xs text-emerald-600">{mentor.checkSize}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mentors Tab */}
        <TabsContent value="mentors" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Expertise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Expertise</SelectItem>
                {PROBLEM_ARCHETYPES.map((archetype) => (
                  <SelectItem key={archetype.value} value={archetype.value}>
                    {archetype.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchQuery || expertiseFilter !== 'all') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('')
                  setExpertiseFilter('all')
                }}
              >
                Clear
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredMentors.length} of {mentors.length} mentors
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          {matches
            .sort((a, b) => b.score - a.score)
            .map((match) => {
              const details = getMatchWithDetails(match.id)
              if (!details) return null
              return <MatchCard key={match.id} match={details} />
            })}
        </TabsContent>

        {/* Startups Needing Help Tab */}
        <TabsContent value="needs" className="space-y-4">
          {startupsNeedingHelp.map(({ bottleneck, startup }) => {
            const stageInfo = getStageInfo(startup!.stage)
            const matchCount = matches.filter((m) => m.bottleneckId === bottleneck.id).length
            return (
              <Card key={bottleneck.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link href={`/startup/${startup!.id}`} className="font-semibold hover:underline">
                          {startup!.name}
                        </Link>
                        <Badge variant="outline">{stageInfo.label}</Badge>
                        <ExpertiseBadge archetype={bottleneck.problemArchetype} />
                      </div>

                      <div className="space-y-3 mt-4">
                        <div>
                          <p className="text-sm font-medium">What's blocking them?</p>
                          <p className="text-sm text-muted-foreground">{bottleneck.rawBlocker}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">What have they tried?</p>
                          <p className="text-sm text-muted-foreground">{bottleneck.rawAttempts}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Success criteria</p>
                          <p className="text-sm text-muted-foreground">{bottleneck.rawSuccessCriteria}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold">{matchCount}</p>
                      <p className="text-xs text-muted-foreground">matches found</p>
                      <Badge
                        variant="secondary"
                        className={
                          bottleneck.status === 'matched'
                            ? 'bg-green-100 text-green-700 mt-2'
                            : 'bg-yellow-100 text-yellow-700 mt-2'
                        }
                      >
                        {bottleneck.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}
