'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  GitCompare, Loader2, Sparkles, Users, Star, TrendingUp,
  Clock, CheckCircle2, XCircle, ArrowRight, Briefcase, MapPin,
  MessageSquare,
} from 'lucide-react'
import type { MatchResult, MatchmakingOutput } from '@/lib/ai/types/matchmaking'

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [insights, setInsights] = useState<MatchmakingOutput['marketplaceInsights'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [stats, setStats] = useState({ pending: 0, approved: 0, completed: 0, total: 0 })

  const fetchMatches = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/partner/matches/suggest')
      const data = await res.json()
      if (data.matches) {
        setMatches(data.matches)
        if (data.insights) setInsights(data.insights)
        // Calculate stats
        const m = data.matches as MatchResult[]
        setStats({
          pending: m.filter((x) => x.status === 'suggested' || x.status === 'pending_review').length,
          approved: m.filter((x) => x.status === 'approved' || x.status === 'active').length,
          completed: m.filter((x) => x.status === 'completed').length,
          total: m.length,
        })
      }
    } catch {
      // Failed to fetch
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSuggestions = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/partner/matches/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchType: 'mentor_startup',
          needs: ['growth_strategy', 'fundraising'],
          urgency: 'soon',
        }),
      })
      const data = await res.json()
      if (data.output?.matches) {
        setMatches(data.output.matches)
        if (data.output.marketplaceInsights) setInsights(data.output.marketplaceInsights)
      }
    } catch {
      // Failed
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => { fetchMatches() }, [])

  const pending = matches.filter((m) => m.status === 'suggested' || m.status === 'pending_review')
  const approved = matches.filter((m) => m.status === 'approved' || m.status === 'active' || m.status === 'intro_sent')
  const completed = matches.filter((m) => m.status === 'completed')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mentor Matches</h1>
          <p className="text-muted-foreground mt-1">AI-powered mentor-startup matching</p>
        </div>
        <Button onClick={handleGenerateSuggestions} disabled={generating}>
          {generating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Generate Suggestions
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Marketplace Insights */}
      {insights && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Marketplace Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">{insights.totalCandidatesEvaluated}</span> candidates evaluated |
              Average score: <span className="font-medium">{Math.round(insights.averageScore)}</span>
            </p>
            {insights.gapAnalysis.length > 0 && (
              <div className="space-y-1">
                {insights.gapAnalysis.map((gap, i) => (
                  <p key={i} className="text-sm text-muted-foreground">Gap: {gap}</p>
                ))}
              </div>
            )}
            {insights.recommendations.length > 0 && (
              <div className="space-y-1">
                {insights.recommendations.map((rec, i) => (
                  <p key={i} className="text-sm text-primary">{rec}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pending.length > 0 ? (
            <div className="space-y-4">
              {pending.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No pending matches"
              description="Generate AI-powered match suggestions to find the best mentors for your startups."
              onGenerate={handleGenerateSuggestions}
              generating={generating}
            />
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {approved.length > 0 ? (
            <div className="space-y-4">
              {approved.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <EmptyState title="No approved matches" description="Approved matches will appear here." />
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completed.length > 0 ? (
            <div className="space-y-4">
              {completed.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <EmptyState title="No completed matches" description="Completed matches will appear here." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Match Card Component ────────────────────────────────────────────────

function MatchCard({ match }: { match: MatchResult }) {
  const [expanded, setExpanded] = useState(false)
  const { candidate, score } = match

  const confidenceColors = {
    high: 'bg-green-100 text-green-600',
    medium: 'bg-yellow-100 text-yellow-600',
    low: 'bg-red-100 text-red-600',
  }

  const statusColors: Record<string, string> = {
    suggested: 'bg-blue-100 text-blue-600',
    pending_review: 'bg-yellow-100 text-yellow-600',
    approved: 'bg-green-100 text-green-600',
    active: 'bg-green-100 text-green-600',
    intro_sent: 'bg-purple-100 text-purple-700',
    completed: 'bg-muted text-muted-foreground',
    declined: 'bg-red-100 text-red-600',
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar placeholder */}
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {candidate.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{candidate.name}</h3>
                <Badge className={statusColors[match.status] || 'bg-muted text-muted-foreground'}>
                  {match.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {candidate.type}
                </Badge>
              </div>
              {candidate.bio && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{candidate.bio}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {candidate.expertise.slice(0, 4).map((exp) => (
                  <Badge key={exp} variant="secondary" className="text-xs">
                    {exp}
                  </Badge>
                ))}
                {candidate.expertise.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{candidate.expertise.length - 4} more
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground">
                {candidate.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {candidate.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {candidate.trackRecord.avgRating}/5 ({candidate.trackRecord.successCount} successes)
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {candidate.availability} availability
                </span>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-bold text-primary">{score.overallScore}</div>
            <Badge className={confidenceColors[score.confidence]}>
              {score.confidence} confidence
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Rank #{match.rank}</p>
          </div>
        </div>

        {/* Score Dimensions */}
        <button
          className="text-sm text-primary mt-4 flex items-center gap-1 hover:underline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide' : 'Show'} score breakdown
          <ArrowRight className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>

        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Score bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(score.dimensions).map(([key, dim]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-medium">{dim.score}</span>
                  </div>
                  <Progress value={dim.score} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">{dim.reasoning}</p>
                </div>
              ))}
            </div>

            {/* Reasoning */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">Match Reasoning</p>
              <p className="text-sm text-muted-foreground">{score.reasoning}</p>
            </div>

            {/* Expected outcomes */}
            {score.expectedOutcomes.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Expected Outcomes</p>
                <ul className="space-y-1">
                  {score.expectedOutcomes.map((outcome, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Potential Challenges */}
            {score.potentialChallenges.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Potential Challenges</p>
                <ul className="space-y-1">
                  {score.potentialChallenges.map((challenge, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <XCircle className="h-3.5 w-3.5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Format */}
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <MessageSquare className="h-3 w-3 mr-1" />
                {score.suggestedEngagementFormat.replace(/_/g, ' ')}
              </Badge>
            </div>

            {/* Actions */}
            {match.status === 'suggested' && (
              <div className="flex gap-2 pt-2">
                <Button size="sm">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approve Match
                </Button>
                <Button size="sm" variant="outline">
                  <XCircle className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────

function EmptyState({
  title,
  description,
  onGenerate,
  generating,
}: {
  title: string
  description: string
  onGenerate?: () => void
  generating?: boolean
}) {
  return (
    <Card>
      <CardContent className="py-16">
        <div className="text-center">
          <GitCompare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">{description}</p>
          {onGenerate && (
            <Button onClick={onGenerate} disabled={generating}>
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate AI Suggestions
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
