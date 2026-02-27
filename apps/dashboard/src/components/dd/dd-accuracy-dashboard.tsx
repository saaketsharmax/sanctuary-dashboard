'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Activity, AlertTriangle, ArrowDown, ArrowUp, BarChart3,
  CheckCircle2, Loader2, Minus, RefreshCw, Target, TrendingUp,
  Zap, Shield,
} from 'lucide-react'
import type { DDAccuracyMetrics } from '@/lib/ai/types/dd-accuracy'
import type { CalibrationReport } from '@/lib/ai/types/calibration-engine'

interface DDAccuracyDashboardProps {
  period?: 'weekly' | 'monthly' | 'quarterly'
}

export function DDAccuracyDashboard({ period = 'monthly' }: DDAccuracyDashboardProps) {
  const [metrics, setMetrics] = useState<DDAccuracyMetrics | null>(null)
  const [calibration, setCalibration] = useState<CalibrationReport | null>(null)
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [calibrating, setCalibrating] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [accRes, calRes] = await Promise.all([
        fetch(`/api/applications/dd/accuracy?period=${period}`),
        fetch('/api/applications/dd/calibration'),
      ])
      const accData = await accRes.json()
      const calData = await calRes.json()

      if (accData.metrics) setMetrics(accData.metrics)
      if (accData.insights) setInsights(accData.insights)
      if (calData.report) setCalibration(calData.report)
    } catch {
      // Failed to fetch — will show empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [period])

  const handleRunCalibration = async () => {
    setCalibrating(true)
    try {
      const res = await fetch('/api/applications/dd/calibration', { method: 'POST' })
      const data = await res.json()
      if (data.calibration?.report) {
        setCalibration(data.calibration.report)
      }
    } catch {
      // Calibration failed
    } finally {
      setCalibrating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            DD System Health
          </h2>
          <p className="text-sm text-muted-foreground">
            Prediction accuracy, calibration, and drift monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleRunCalibration} disabled={calibrating}>
            {calibrating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Zap className="h-4 w-4 mr-1" />}
            Run Calibration
          </Button>
        </div>
      </div>

      {/* Top-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Overall Accuracy"
          value={`${metrics?.overallAccuracy || 0}%`}
          icon={<Target className="h-4 w-4" />}
          trend={metrics && metrics.overallAccuracy >= 75 ? 'up' : metrics && metrics.overallAccuracy >= 50 ? 'neutral' : 'down'}
        />
        <KPICard
          label="Partner Agreement"
          value={`${metrics?.partnerOverrides.agreementRate || 0}%`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          trend={metrics && metrics.partnerOverrides.agreementRate >= 80 ? 'up' : 'neutral'}
        />
        <KPICard
          label="Total Decisions"
          value={`${metrics?.totalDecisions || 0}`}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <KPICard
          label="System Health"
          value={calibration?.overallHealth || 'N/A'}
          icon={<Activity className="h-4 w-4" />}
          trend={calibration?.overallHealth === 'excellent' || calibration?.overallHealth === 'good' ? 'up' : 'down'}
        />
      </div>

      <Tabs defaultValue="accuracy">
        <TabsList>
          <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
          <TabsTrigger value="calibration">Calibration</TabsTrigger>
          <TabsTrigger value="drift">Drift</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Accuracy Tab */}
        <TabsContent value="accuracy" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prediction Accuracy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Prediction Accuracy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics?.predictionAccuracy ? (
                  <>
                    <AccuracyRow
                      label="Invest Recommendations"
                      correct={metrics.predictionAccuracy.investRecommendations.correctOutcomes}
                      total={metrics.predictionAccuracy.investRecommendations.total}
                      accuracy={metrics.predictionAccuracy.investRecommendations.accuracy}
                    />
                    <AccuracyRow
                      label="Pass Recommendations"
                      correct={metrics.predictionAccuracy.passRecommendations.correctOutcomes}
                      total={metrics.predictionAccuracy.passRecommendations.total}
                      accuracy={metrics.predictionAccuracy.passRecommendations.accuracy}
                    />
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Conditional (resolved positive)</span>
                        <span>{metrics.predictionAccuracy.conditionalRecommendations.resolvedPositive}/{metrics.predictionAccuracy.conditionalRecommendations.total}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No prediction data yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Partner Override Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Partner Override Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics?.partnerOverrides.dimensionOverrides.map((dim) => (
                  <div key={dim.dimension} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{dim.dimension}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {dim.overrideRate}% override
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            dim.direction === 'ai_too_high' ? 'text-red-600' :
                            dim.direction === 'ai_too_low' ? 'text-blue-600' :
                            'text-green-600'
                          }`}
                        >
                          {dim.direction === 'ai_too_high' ? 'AI too high' :
                           dim.direction === 'ai_too_low' ? 'AI too low' :
                           'Balanced'}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={100 - dim.overrideRate} className="h-1.5" />
                  </div>
                )) || <p className="text-sm text-muted-foreground">No override data yet.</p>}
              </CardContent>
            </Card>
          </div>

          {/* Confidence Calibration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Confidence Calibration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {metrics?.confidenceCalibration.map((bucket) => (
                  <div key={bucket.bucket} className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">{bucket.bucket}</p>
                    <p className="text-lg font-bold">{bucket.actualAccuracy}%</p>
                    <p className="text-xs text-muted-foreground">predicted: {bucket.predictedAccuracy}%</p>
                    <p className={`text-xs font-medium ${
                      bucket.calibrationError > 15 ? 'text-red-600' :
                      bucket.calibrationError > 8 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {bucket.calibrationError}% error
                    </p>
                    <p className="text-xs text-muted-foreground">n={bucket.sampleSize}</p>
                  </div>
                )) || <p className="text-sm text-muted-foreground col-span-5">No calibration data yet.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calibration Tab */}
        <TabsContent value="calibration" className="space-y-4 mt-4">
          {calibration ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Calibration Status</span>
                    <Badge className={
                      calibration.overallHealth === 'excellent' ? 'bg-green-100 text-green-700' :
                      calibration.overallHealth === 'good' ? 'bg-blue-100 text-blue-700' :
                      calibration.overallHealth === 'needs_attention' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {calibration.overallHealth.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{calibration.healthScore}</p>
                      <p className="text-xs text-muted-foreground">Health Score</p>
                    </div>
                    <Progress value={calibration.healthScore} className="flex-1 h-3" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Last calibrated: {new Date(calibration.generatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>

              {/* Recommended Adjustments */}
              {calibration.recommendedAdjustments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recommended Weight Adjustments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {calibration.recommendedAdjustments.map((adj, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{adj.dimension}</span>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">{adj.originalWeight}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span className="font-medium">{adj.adjustedWeight}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{adj.adjustmentReason}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Confidence: {Math.round(adj.confidence * 100)}%
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Based on {adj.basedOnSamples} reviews
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Partner Alignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Partner Alignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 mb-2">
                    <p className="text-2xl font-bold">{calibration.partnerAlignment.overallAgreementRate}%</p>
                    <p className="text-sm text-muted-foreground">agreement rate</p>
                  </div>
                  {calibration.partnerAlignment.topInsights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold">No Calibration Report</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Run calibration to generate a system health report and weight adjustment recommendations.
                </p>
                <Button onClick={handleRunCalibration} disabled={calibrating}>
                  {calibrating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Zap className="h-4 w-4 mr-1" />}
                  Run Calibration
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Drift Tab */}
        <TabsContent value="drift" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Drift Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics?.driftMetrics ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alert Level</span>
                    <Badge className={
                      metrics.driftMetrics.alertLevel === 'normal' ? 'bg-green-100 text-green-700' :
                      metrics.driftMetrics.alertLevel === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {metrics.driftMetrics.alertLevel}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Score Distribution Shift</p>
                      <p className="text-xl font-bold">{metrics.driftMetrics.scoreDistributionShift}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Confidence Drift</p>
                      <p className="text-xl font-bold">{metrics.driftMetrics.confidenceDrift}</p>
                    </div>
                  </div>
                  {metrics.driftMetrics.signalWeightDrift.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Signal Weight Drift</p>
                      {metrics.driftMetrics.signalWeightDrift.map((s, i) => (
                        <div key={i} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                          <span>{s.signal}</span>
                          <span className={s.drift > 0.1 ? 'text-red-600' : 'text-muted-foreground'}>
                            {s.originalWeight.toFixed(2)} → {s.effectiveWeight.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Last checked: {new Date(metrics.driftMetrics.lastChecked).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No drift data available yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Performance Over Time */}
          {metrics?.performanceOverTime && metrics.performanceOverTime.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metrics.performanceOverTime.map((p) => (
                    <div key={p.period} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                      <span className="font-medium">{p.period}</span>
                      <div className="flex gap-4">
                        <span>Accuracy: {p.accuracy}%</span>
                        <span>Agreement: {p.agreementRate}%</span>
                        <span>Conf: {p.avgConfidence}%</span>
                        <Badge variant="outline" className="text-xs">n={p.decisionsCount}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AI-Generated Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.length > 0 ? (
                insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                    <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Insights will appear here after the system processes enough data.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Calibration Recommendations */}
          {calibration?.recommendations && calibration.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Calibration Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {calibration.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Zap className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Claim Verification Accuracy */}
          {metrics?.claimVerificationAccuracy && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Claim Verification Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">Total claims verified: {metrics.claimVerificationAccuracy.totalClaimsVerified}</p>
                <div className="space-y-2">
                  {metrics.claimVerificationAccuracy.verdictAccuracy.map((v) => (
                    <div key={v.verdict} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                      <span className="capitalize font-medium">{v.verdict.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <span>{v.confirmedCorrect}/{v.totalPredictions}</span>
                        <Badge variant={v.accuracy >= 70 ? 'default' : 'destructive'} className="text-xs">
                          {v.accuracy}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Helper Components ───────────────────────────────────────────────────

function KPICard({ label, value, icon, trend }: {
  label: string
  value: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold capitalize">{value}</p>
          {trend === 'up' && <ArrowUp className="h-4 w-4 text-green-600" />}
          {trend === 'down' && <ArrowDown className="h-4 w-4 text-red-600" />}
          {trend === 'neutral' && <Minus className="h-4 w-4 text-yellow-600" />}
        </div>
      </CardContent>
    </Card>
  )
}

function AccuracyRow({ label, correct, total, accuracy }: {
  label: string
  correct: number
  total: number
  accuracy: number
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">
          {correct}/{total} ({accuracy}%)
        </span>
      </div>
      <Progress value={accuracy} className="h-1.5" />
    </div>
  )
}

// Missing import resolution — ArrowRight was used in calibration tab
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  )
}
