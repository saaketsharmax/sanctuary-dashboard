'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/sonner'
import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, RefreshCw, Shield, ShieldCheck, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import {
  DDScoreHeader,
  DDCategoryCard,
  DDRedFlags,
  ClaimRow,
  DDRecommendationBanner,
  DDFollowUpQuestions,
  DDOmissions,
  DDTeamAssessment,
  DDMarketAssessment,
  DDGodMode,
} from '@/components/dd'
import type { DueDiligenceReport, DDClaim } from '@/lib/ai/types/due-diligence'
import type { GodModeDDReport } from '@/lib/ai/types/god-mode-dd'

interface DDPageProps {
  params: Promise<{ id: string }>
}

interface DDStatus {
  ddStatus: string
  claimsCount: number
  startedAt: string | null
  completedAt: string | null
  report: {
    overallScore: number
    grade: string
    totalClaims: number
    verifiedClaims: number
    refutedClaims: number
    verificationCoverage: number
  } | null
}

export default function DDPage({ params }: DDPageProps) {
  const { id } = use(params)

  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [ddStatus, setDDStatus] = useState<DDStatus | null>(null)
  const [report, setReport] = useState<DueDiligenceReport | null>(null)
  const [claims, setClaims] = useState<DDClaim[]>([])
  const [companyName, setCompanyName] = useState('')

  // God Mode state
  const [godModeReport, setGodModeReport] = useState<GodModeDDReport | null>(null)
  const [runningGodMode, setRunningGodMode] = useState(false)

  // Category filter
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch DD status
  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/applications/${id}/dd`)
      const data = await res.json()
      if (data.success) {
        setDDStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch DD status:', error)
    }
  }

  // Fetch full report
  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/applications/${id}/dd/report`)
      const data = await res.json()
      if (data.success && data.report) {
        setReport(data.report)
      }
    } catch (error) {
      console.error('Failed to fetch DD report:', error)
    }
  }

  // Fetch claims
  const fetchClaims = async () => {
    try {
      const res = await fetch(`/api/applications/${id}/dd/claims`)
      const data = await res.json()
      if (data.success) {
        setClaims(data.claims || [])
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error)
    }
  }

  // Fetch company name
  const fetchCompanyName = async () => {
    try {
      const res = await fetch(`/api/partner/applications/${id}`)
      const data = await res.json()
      if (data.success && data.application) {
        setCompanyName(data.application.companyName)
      }
    } catch (error) {
      console.error('Failed to fetch application:', error)
    }
  }

  // Fetch God Mode report
  const fetchGodMode = async () => {
    try {
      const res = await fetch(`/api/applications/${id}/dd/god-mode`)
      const data = await res.json()
      if (data.godModeReport) {
        setGodModeReport(data.godModeReport)
      }
    } catch (error) {
      console.error('Failed to fetch God Mode report:', error)
    }
  }

  // Run God Mode analysis
  const handleRunGodMode = async () => {
    setRunningGodMode(true)
    try {
      const res = await fetch(`/api/applications/${id}/dd/god-mode`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.godModeReport) {
        setGodModeReport(data.godModeReport)
        toast.success(`God Mode complete — Score: ${data.godModeReport.godModeScore}/100`)
      } else {
        toast.error(data.error || 'God Mode analysis failed')
      }
    } catch (error) {
      toast.error('Failed to run God Mode analysis')
    } finally {
      setRunningGodMode(false)
    }
  }

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchStatus(), fetchCompanyName()])
      setLoading(false)
    }
    load()
  }, [id])

  // Load report + claims + god mode when DD is completed
  useEffect(() => {
    if (ddStatus?.ddStatus === 'completed') {
      fetchReport()
      fetchClaims()
      fetchGodMode()
    }
  }, [ddStatus?.ddStatus])

  // Run DD pipeline
  const handleRunDD = async (force = false) => {
    setRunning(true)
    try {
      const res = await fetch(`/api/applications/${id}/dd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Due diligence completed — Grade: ${data.metadata?.grade || 'N/A'}`)
        if (data.report) setReport(data.report)
        await fetchStatus()
        await fetchClaims()
      } else {
        toast.error(data.error || 'DD pipeline failed')
      }
    } catch (error) {
      toast.error('Failed to run due diligence')
    } finally {
      setRunning(false)
    }
  }

  // Regenerate report only
  const handleRegenerateReport = async () => {
    setRegenerating(true)
    try {
      const res = await fetch(`/api/applications/${id}/dd/report`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success && data.report) {
        toast.success('Report regenerated')
        setReport(data.report)
        await fetchStatus()
      } else {
        toast.error(data.error || 'Failed to regenerate report')
      }
    } catch (error) {
      toast.error('Failed to regenerate report')
    } finally {
      setRegenerating(false)
    }
  }

  // Filter claims
  const filteredClaims = claims.filter(c => {
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    return true
  })

  // Get unique categories and statuses from claims
  const categories = [...new Set(claims.map(c => c.category))]
  const statuses = [...new Set(claims.map(c => c.status))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isCompleted = ddStatus?.ddStatus === 'completed'
  const isRunning = ddStatus?.ddStatus === 'claims_extracted' || ddStatus?.ddStatus === 'ai_verification'

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href={`/partner/applications/${id}`}>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Application
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Due Diligence {companyName && `— ${companyName}`}
          </h1>
          {ddStatus?.completedAt && (
            <p className="text-sm text-muted-foreground mt-1">
              Completed {new Date(ddStatus.completedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateReport}
              disabled={regenerating}
            >
              {regenerating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
              Regenerate Report
            </Button>
          )}
          <Button
            onClick={() => handleRunDD(isCompleted)}
            disabled={running || isRunning}
          >
            {running || isRunning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4 mr-2" />
            )}
            {isCompleted ? 'Re-run DD' : running || isRunning ? 'Running...' : 'Run Due Diligence'}
          </Button>
        </div>
      </div>

      {/* Running state */}
      {(running || isRunning) && !report && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Running due diligence pipeline...</p>
            <p className="text-xs text-muted-foreground">
              Extracting claims, verifying with web search, generating report
            </p>
          </CardContent>
        </Card>
      )}

      {/* Not started state */}
      {!isCompleted && !running && !isRunning && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center gap-4">
            <Shield className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-semibold">Due Diligence Not Started</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Run due diligence to extract and verify all claims from this application.
              </p>
            </div>
            <Button onClick={() => handleRunDD()}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Run Due Diligence
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Completed state */}
      {isCompleted && report && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {report.teamAssessment && (
              <TabsTrigger value="team">
                Team ({report.teamAssessment.teamGrade})
              </TabsTrigger>
            )}
            {report.marketAssessment && (
              <TabsTrigger value="market">
                Market ({report.marketAssessment.marketGrade})
              </TabsTrigger>
            )}
            <TabsTrigger value="claims">Claims ({claims.length})</TabsTrigger>
            <TabsTrigger value="redflags">
              Red Flags ({report.redFlags?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="followup">
              Follow-up ({report.followUpQuestions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="godmode" className="gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              God Mode {godModeReport && `(${godModeReport.godModeScore})`}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Recommendation Banner */}
            {report.recommendation && (
              <DDRecommendationBanner recommendation={report.recommendation} />
            )}

            <DDScoreHeader
              grade={report.ddGrade}
              overallScore={report.overallDDScore}
              verificationCoverage={report.verificationCoverage}
              totalClaims={report.claims?.length || claims.length}
              confirmedClaims={
                (report.claims || claims).filter(
                  c => c.status === 'confirmed' || c.status === 'ai_verified'
                ).length
              }
              refutedClaims={
                (report.claims || claims).filter(c => c.status === 'refuted').length
              }
              redFlagCount={report.redFlags?.length || 0}
            />

            {/* Executive Summary */}
            {report.executiveSummary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{report.executiveSummary}</p>
                </CardContent>
              </Card>
            )}

            {/* Category Breakdown */}
            {report.categoryScores && report.categoryScores.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Category Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.categoryScores.map(cs => (
                    <DDCategoryCard key={cs.category} score={cs} />
                  ))}
                </div>
              </div>
            )}

            {/* Red Flags */}
            <DDRedFlags redFlags={report.redFlags || []} />

            {/* Omissions */}
            {report.omissions && report.omissions.length > 0 && (
              <DDOmissions omissions={report.omissions} />
            )}
          </TabsContent>

          {/* Team Tab */}
          {report.teamAssessment && (
            <TabsContent value="team" className="space-y-6">
              <DDTeamAssessment assessment={report.teamAssessment} />
            </TabsContent>
          )}

          {/* Market Tab */}
          {report.marketAssessment && (
            <TabsContent value="market" className="space-y-6">
              <DDMarketAssessment assessment={report.marketAssessment} />
            </TabsContent>
          )}

          {/* Claims Tab */}
          <TabsContent value="claims" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <select
                className="text-sm border rounded px-2 py-1"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <select
                className="text-sm border rounded px-2 py-1"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {statuses.map(s => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <span className="text-sm text-muted-foreground self-center ml-2">
                {filteredClaims.length} of {claims.length} claims
              </span>
            </div>

            {/* Claims list */}
            <div className="space-y-2">
              {filteredClaims.map(claim => (
                <ClaimRow key={claim.id} claim={claim} />
              ))}
              {filteredClaims.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No claims match the current filters.
                </p>
              )}
            </div>
          </TabsContent>

          {/* Red Flags Tab */}
          <TabsContent value="redflags" className="space-y-6">
            <DDRedFlags redFlags={report.redFlags || []} />
            {report.omissions && report.omissions.length > 0 && (
              <DDOmissions omissions={report.omissions} />
            )}
          </TabsContent>

          {/* Follow-up Questions Tab */}
          <TabsContent value="followup" className="space-y-6">
            {report.followUpQuestions && report.followUpQuestions.length > 0 ? (
              <DDFollowUpQuestions questions={report.followUpQuestions} />
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No follow-up questions generated.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* God Mode Tab */}
          <TabsContent value="godmode" className="space-y-6">
            {godModeReport ? (
              <DDGodMode report={godModeReport} />
            ) : (
              <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center gap-4">
                  {runningGodMode ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                      <p className="text-muted-foreground">Running God Mode analysis...</p>
                      <p className="text-xs text-muted-foreground">
                        Behavioral forensics, signal consistency, contrarian detection, pattern matching
                      </p>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-12 w-12 text-purple-400" />
                      <div className="text-center">
                        <h3 className="font-semibold">God Mode Analysis</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-md">
                          Go beyond traditional DD. Analyze behavioral patterns, find contrarian signals,
                          project moat durability, and uncover what everyone else misses.
                        </p>
                      </div>
                      <Button onClick={handleRunGodMode} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Run God Mode
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Toaster />
    </div>
  )
}
