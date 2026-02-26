'use client'

import { useState } from 'react'
import {
  Brain,
  Eye,
  TrendingUp,
  Shield,
  Target,
  Zap,
  BarChart3,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { GodModeDDReport } from '@/lib/ai/types/god-mode-dd'

interface DDGodModeProps {
  report: GodModeDDReport
}

// ─── Score Color Helpers ─────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-600'
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

function convictionConfig(level: GodModeDDReport['convictionLevel']) {
  const configs = {
    strong_conviction_invest: { label: 'Strong Conviction Invest', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
    conviction_invest: { label: 'Conviction Invest', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2 },
    neutral: { label: 'Neutral', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: HelpCircle },
    conviction_pass: { label: 'Conviction Pass', color: 'bg-red-50 text-red-700 border-red-100', icon: XCircle },
    strong_conviction_pass: { label: 'Strong Conviction Pass', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  }
  return configs[level] || configs.neutral
}

function sentimentIcon(sentiment: string) {
  const icons: Record<string, string> = {
    passionate: '🔥',
    confident: '💪',
    uncertain: '🤔',
    defensive: '🛡️',
    evasive: '👀',
  }
  return icons[sentiment] || '•'
}

// ─── Sub-Components ──────────────────────────────────────────────────────

function MetricCard({ icon: Icon, title, score, grade, children }: {
  icon: React.ElementType
  title: string
  score?: number
  grade?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">{title}</CardTitle>
                  {score !== undefined && (
                    <span className={`text-2xl font-bold ${scoreColor(score)}`}>{score}</span>
                  )}
                  {grade && (
                    <Badge variant="outline" className="ml-2 text-xs">{grade}</Badge>
                  )}
                </div>
              </div>
              {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

function ScoreBar({ label, score, className }: { label: string; score: number; className?: string }) {
  return (
    <div className={className}>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${scoreColor(score)}`}>{score}</span>
      </div>
      <Progress value={score} className="h-2" />
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────

export function DDGodMode({ report }: DDGodModeProps) {
  const conviction = convictionConfig(report.convictionLevel)
  const ConvictionIcon = conviction.icon

  return (
    <div className="space-y-6">
      {/* Hero: God Mode Score + Conviction */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-indigo-50/50">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.godModeScore}</div>
                  <div className="text-[10px] opacity-75">GOD MODE</div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <h2 className="text-lg font-semibold">God Mode Analysis</h2>
                </div>
                <Badge className={`${conviction.color} border`}>
                  <ConvictionIcon className="h-3 w-3 mr-1" />
                  {conviction.label}
                </Badge>
              </div>
            </div>
            <div className="text-sm text-muted-foreground max-w-md">
              <p className="italic">&ldquo;{report.oneLineVerdict}&rdquo;</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alpha Signals + Blind Spots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              Alpha Signals
            </CardTitle>
            <p className="text-xs text-muted-foreground">What traditional DD would miss</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.alphaSignals?.map((signal, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="text-purple-600 font-bold mt-0.5">{i + 1}.</span>
                <span>{signal}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-600" />
              Blind Spots
            </CardTitle>
            <p className="text-xs text-muted-foreground">What we still can&apos;t determine</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.blindSpots?.map((spot, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span>{spot}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Memo Addendum */}
      {report.memoAddendum && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Deep Analysis (Memo Addendum)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-wrap leading-relaxed">{report.memoAddendum}</div>
          </CardContent>
        </Card>
      )}

      {/* 9 Metric Cards */}
      <div className="space-y-3">
        {/* 1. Behavioral Fingerprint */}
        {report.behavioralFingerprint && (
          <MetricCard
            icon={Brain}
            title="Founder Behavioral Fingerprint"
            score={100 - report.behavioralFingerprint.deceptionRiskScore}
          >
            <div className="grid grid-cols-2 gap-4">
              <ScoreBar label="Confidence Consistency" score={report.behavioralFingerprint.confidenceConsistency} />
              <ScoreBar label="Specificity Score" score={report.behavioralFingerprint.specificityScore} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Deception Risk</span>
                <span className={scoreColor(100 - report.behavioralFingerprint.deceptionRiskScore)}>
                  {report.behavioralFingerprint.deceptionRiskScore}/100
                </span>
              </div>
              <Progress value={report.behavioralFingerprint.deceptionRiskScore} className="h-2" />
            </div>

            {report.behavioralFingerprint.founderArchetype && (
              <div className="text-sm">
                <span className="text-muted-foreground">Archetype: </span>
                <Badge variant="outline">{report.behavioralFingerprint.founderArchetype}</Badge>
              </div>
            )}

            {/* Emotional Arc */}
            {report.behavioralFingerprint.emotionalArcMap?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Emotional Arc</p>
                <div className="flex flex-wrap gap-2">
                  {report.behavioralFingerprint.emotionalArcMap.map((arc, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs bg-muted/50 rounded px-2 py-1">
                      <span>{sentimentIcon(arc.sentiment)}</span>
                      <span className="capitalize">{arc.section.replace(/_/g, ' ')}</span>
                      <span className="text-muted-foreground">→ {arc.sentiment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deflection Patterns */}
            {report.behavioralFingerprint.deflectionPatterns?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Deflection Patterns</p>
                {report.behavioralFingerprint.deflectionPatterns.map((dp, i) => (
                  <div key={i} className="text-xs flex items-center gap-2 py-1">
                    <Badge variant="outline" className="text-[10px]">{dp.deflectionType.replace(/_/g, ' ')}</Badge>
                    <span>{dp.topic}</span>
                    <span className="text-muted-foreground">(x{dp.count})</span>
                  </div>
                ))}
              </div>
            )}

            {/* Authenticity Markers */}
            {report.behavioralFingerprint.authenticityMarkers?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Authenticity Markers</p>
                {report.behavioralFingerprint.authenticityMarkers.map((marker, i) => (
                  <div key={i} className="text-xs flex gap-2 py-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{marker}</span>
                  </div>
                ))}
              </div>
            )}
          </MetricCard>
        )}

        {/* 2. Signal Consistency */}
        {report.signalConsistency && (
          <MetricCard icon={Target} title="Signal Consistency Index" score={report.signalConsistency.overallConsistency}>
            <ScoreBar label="Trust Score" score={report.signalConsistency.trustScore} />

            {report.signalConsistency.sourceComparisons?.map((comp, i) => (
              <div key={i} className="text-xs border rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="capitalize">{comp.source1.replace(/_/g, ' ')} vs {comp.source2.replace(/_/g, ' ')}</span>
                  <span className="text-muted-foreground">{comp.consistentClaims} consistent / {comp.inconsistentClaims} inconsistent</span>
                </div>
                {comp.contradictions?.map((c, j) => (
                  <div key={j} className="mt-2 pl-2 border-l-2 border-red-200">
                    <div className="font-medium">{c.claim}</div>
                    <div className="text-muted-foreground">Source 1: {c.source1Says}</div>
                    <div className="text-muted-foreground">Source 2: {c.source2Says}</div>
                    <Badge variant={c.severity === 'critical' ? 'destructive' : 'outline'} className="text-[10px] mt-1">
                      {c.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            ))}

            {report.signalConsistency.storyEvolutionTracker?.map((evt, i) => (
              <div key={i} className="text-xs bg-muted/30 rounded p-2">
                <div className="font-medium">{evt.claim}</div>
                <div className="text-muted-foreground mt-1">App: {evt.applicationVersion}</div>
                <div className="text-muted-foreground">Interview: {evt.interviewVersion}</div>
                <Badge variant="outline" className="text-[10px] mt-1 capitalize">{evt.interpretation.replace(/_/g, ' ')}</Badge>
              </div>
            ))}
          </MetricCard>
        )}

        {/* 3. Revenue Quality */}
        {report.revenueQuality && (
          <MetricCard icon={BarChart3} title="Revenue Quality" score={report.revenueQuality.score} grade={report.revenueQuality.revenueHealthGrade}>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Type: </span>
                <Badge variant="outline">{report.revenueQuality.revenueType}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Concentration Risk: </span>
                <Badge variant={report.revenueQuality.concentration.risk === 'high' ? 'destructive' : 'outline'}>
                  {report.revenueQuality.concentration.risk}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Top Customer: </span>
                <span>{report.revenueQuality.concentration.top1CustomerPct}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Est. Monthly Churn: </span>
                <span>{report.revenueQuality.churnPrediction.estimatedMonthlyChurn}%</span>
              </div>
            </div>
            <ScoreBar label="Expansion Potential (est. NRR)" score={report.revenueQuality.expansionPotential} />
            {report.revenueQuality.organicVsPaid && (
              <div className="text-xs text-muted-foreground">
                Est. {report.revenueQuality.organicVsPaid.estimatedOrganicPct}% organic — {report.revenueQuality.organicVsPaid.basis}
              </div>
            )}
          </MetricCard>
        )}

        {/* 4. Capital Efficiency */}
        {report.capitalEfficiency && (
          <MetricCard icon={TrendingUp} title="Capital Efficiency" score={report.capitalEfficiency.efficiencyScore}>
            <div className="grid grid-cols-3 gap-3 text-xs text-center">
              <div className="bg-muted/30 rounded p-2">
                <div className="text-lg font-bold">{report.capitalEfficiency.burnMultiple}x</div>
                <div className="text-muted-foreground">Burn Multiple</div>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <div className="text-lg font-bold">{report.capitalEfficiency.predictedRunway}mo</div>
                <div className="text-muted-foreground">Est. Runway</div>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <div className="text-lg font-bold">{Math.round(report.capitalEfficiency.teamCostRatio * 100)}%</div>
                <div className="text-muted-foreground">Team Cost Ratio</div>
              </div>
            </div>
            {report.capitalEfficiency.comparableCompanies?.map((comp, i) => (
              <div key={i} className="text-xs flex items-center justify-between bg-muted/20 rounded px-2 py-1">
                <span>{comp.name}</span>
                <span className="text-muted-foreground">{comp.burnMultipleAtSameStage}x burn → {comp.outcome}</span>
              </div>
            ))}
            {report.capitalEfficiency.capitalStrategy && (
              <p className="text-xs text-muted-foreground italic">{report.capitalEfficiency.capitalStrategy}</p>
            )}
          </MetricCard>
        )}

        {/* 5. Network Effect Potential */}
        {report.networkEffectPotential && (
          <MetricCard icon={Zap} title="Network Effect Potential" score={report.networkEffectPotential.score}>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="outline" className="capitalize">{report.networkEffectPotential.type.replace(/_/g, ' ')}</Badge>
              <span className="text-muted-foreground ml-2">Switching Cost:</span>
              <Badge variant="outline" className="capitalize">{report.networkEffectPotential.switchingCostEstimate}</Badge>
            </div>
            {report.networkEffectPotential.viralCoefficient && (
              <div className="text-xs text-muted-foreground">
                Est. viral coefficient: {report.networkEffectPotential.viralCoefficient.estimated} — {report.networkEffectPotential.viralCoefficient.basis}
              </div>
            )}
            {report.networkEffectPotential.dataFlywheel?.exists && (
              <div className="text-xs bg-emerald-50 text-emerald-700 rounded p-2">
                Data Flywheel: {report.networkEffectPotential.dataFlywheel.description} (strength: {report.networkEffectPotential.dataFlywheel.strength}/100)
              </div>
            )}
            {report.networkEffectPotential.lockInMechanisms?.map((m, i) => (
              <div key={i} className="text-xs flex gap-2">
                <Shield className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                <span>{m}</span>
              </div>
            ))}
          </MetricCard>
        )}

        {/* 6. Moat Durability */}
        {report.moatDurability && (
          <MetricCard icon={Shield} title="Competitive Moat Durability" score={report.moatDurability.currentMoatScore}>
            <div className="grid grid-cols-3 gap-3 text-xs text-center">
              <div className="bg-muted/30 rounded p-2">
                <div className={`text-lg font-bold ${scoreColor(report.moatDurability.currentMoatScore)}`}>
                  {report.moatDurability.currentMoatScore}
                </div>
                <div className="text-muted-foreground">Today</div>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <div className={`text-lg font-bold ${scoreColor(report.moatDurability.projectedMoatIn12Months)}`}>
                  {report.moatDurability.projectedMoatIn12Months}
                </div>
                <div className="text-muted-foreground">12 Months</div>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <div className={`text-lg font-bold ${scoreColor(report.moatDurability.projectedMoatIn36Months)}`}>
                  {report.moatDurability.projectedMoatIn36Months}
                </div>
                <div className="text-muted-foreground">36 Months</div>
              </div>
            </div>
            <Badge variant="outline" className="capitalize">{report.moatDurability.moatTrajectory}</Badge>

            {report.moatDurability.moatTypes?.map((moat, i) => (
              <div key={i} className="text-xs flex items-center justify-between border-b last:border-0 py-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] capitalize">{moat.type.replace(/_/g, ' ')}</Badge>
                  <span className={scoreColor(moat.strength)}>{moat.strength}/100</span>
                </div>
                <Badge variant="outline" className={`text-[10px] ${moat.durability === 'increasing' ? 'text-emerald-600' : moat.durability === 'eroding' ? 'text-red-600' : ''}`}>
                  {moat.durability}
                </Badge>
              </div>
            ))}

            {report.moatDurability.biggestMoatThreat && (
              <div className="text-xs text-red-600 bg-red-50 rounded p-2">
                Biggest threat: {report.moatDurability.biggestMoatThreat}
              </div>
            )}
            {report.moatDurability.timeToCompetitorParity && (
              <div className="text-xs text-muted-foreground">
                Est. time to competitor parity: {report.moatDurability.timeToCompetitorParity.months} months
              </div>
            )}
          </MetricCard>
        )}

        {/* 7. Market Timing */}
        {report.marketTiming && (
          <MetricCard icon={TrendingUp} title="Market Timing Index" score={report.marketTiming.score}>
            <div className="grid grid-cols-2 gap-3">
              <ScoreBar label="Technology Readiness" score={report.marketTiming.technologyReadiness.score} />
              <ScoreBar label="Regulatory Tailwinds" score={report.marketTiming.regulatoryTailwinds.score} />
              <ScoreBar label="Economic Alignment" score={report.marketTiming.economicCycleAlignment.score} />
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Adoption Curve:</span>
              <Badge variant="outline" className="capitalize">{report.marketTiming.adoptionCurvePosition.replace(/_/g, ' ')}</Badge>
            </div>

            {report.marketTiming.competitorActivitySignal && (
              <div className="text-xs flex items-center gap-2">
                <span className="text-muted-foreground">Competitor Activity:</span>
                <Badge variant="outline" className="capitalize">{report.marketTiming.competitorActivitySignal.signal.replace(/_/g, ' ')}</Badge>
                <span className="text-muted-foreground">({report.marketTiming.competitorActivitySignal.recentFundings} recent fundings, {report.marketTiming.competitorActivitySignal.totalRaised} raised)</span>
              </div>
            )}

            {report.marketTiming.windowOfOpportunity && (
              <div className="text-xs bg-blue-50 text-blue-700 rounded p-2">
                Window of opportunity: ~{report.marketTiming.windowOfOpportunity.months} months — {report.marketTiming.windowOfOpportunity.reasoning}
              </div>
            )}

            {report.marketTiming.timingVerdict && (
              <p className="text-xs text-muted-foreground italic">{report.marketTiming.timingVerdict}</p>
            )}
          </MetricCard>
        )}

        {/* 8. Contrarian Signals */}
        {report.contrarianSignals && (
          <MetricCard icon={Sparkles} title="Contrarian Signals">
            {report.contrarianSignals.unconventionalStrengths?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-emerald-700 mb-2">Unconventional Strengths</p>
                {report.contrarianSignals.unconventionalStrengths.map((s, i) => (
                  <div key={i} className="text-xs bg-emerald-50 rounded p-2 mb-2">
                    <div className="font-medium">{s.signal}</div>
                    <div className="text-muted-foreground mt-1">Why counter-intuitive: {s.whyCounterIntuitive}</div>
                    <div className="text-muted-foreground">Precedent: {s.historicalPrecedent}</div>
                    <div className="text-emerald-700 mt-1">Upside: {s.potentialUpside}</div>
                  </div>
                ))}
              </div>
            )}

            {report.contrarianSignals.hiddenRisks?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-700 mb-2">Hidden Risks</p>
                {report.contrarianSignals.hiddenRisks.map((r, i) => (
                  <div key={i} className="text-xs bg-red-50 rounded p-2 mb-2">
                    <div className="font-medium">{r.signal}</div>
                    <div className="text-muted-foreground mt-1">Why overlooked: {r.whyOverlooked}</div>
                    <div className="text-red-700 mt-1">Downside: {r.potentialDownside}</div>
                  </div>
                ))}
              </div>
            )}

            {report.contrarianSignals.nonObviousPatterns?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-purple-700 mb-2">Non-Obvious Patterns</p>
                {report.contrarianSignals.nonObviousPatterns.map((p, i) => (
                  <div key={i} className="text-xs bg-purple-50 rounded p-2 mb-2">
                    <div className="font-medium">{p.pattern}</div>
                    <div className="text-muted-foreground mt-1">Implication: {p.implication}</div>
                  </div>
                ))}
              </div>
            )}

            {report.contrarianSignals.founderEdgeCases?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-blue-700 mb-2">Founder Edge Cases</p>
                {report.contrarianSignals.founderEdgeCases.map((f, i) => (
                  <div key={i} className="text-xs bg-blue-50 rounded p-2 mb-2">
                    <div className="font-medium">{f.trait}</div>
                    <div className="text-muted-foreground">Conventional: {f.conventionalView}</div>
                    <div className="text-blue-700">Actual: {f.actualCorrelation}</div>
                  </div>
                ))}
              </div>
            )}
          </MetricCard>
        )}

        {/* 9. Pattern Match */}
        {report.patternMatch && (
          <MetricCard icon={Target} title="Pattern Matching">
            {report.patternMatch.archetypeMatch && (
              <div className="bg-muted/30 rounded p-3 text-sm">
                <div className="font-medium">{report.patternMatch.archetypeMatch.archetype}</div>
                <p className="text-xs text-muted-foreground mt-1">{report.patternMatch.archetypeMatch.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span>Typical: {report.patternMatch.archetypeMatch.typicalOutcome}</span>
                  <Badge variant="outline">Survival: {report.patternMatch.archetypeMatch.survivalRate}%</Badge>
                </div>
              </div>
            )}

            {report.patternMatch.closestHistoricalMatches?.map((m, i) => (
              <div key={i} className="text-xs border rounded p-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{m.companyName}</span>
                  <Badge variant="outline">{m.similarity}% similar</Badge>
                </div>
                <div className="text-muted-foreground mt-1">Outcome: {m.outcome}</div>
                <div className="mt-1">
                  <span className="text-emerald-600">Parallels: </span>
                  {m.keyParallels.join(', ')}
                </div>
                <div className="mt-1">
                  <span className="text-amber-600">Differences: </span>
                  {m.keyDifferences.join(', ')}
                </div>
              </div>
            ))}

            {report.patternMatch.outlierFactors?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Outlier Factors (breaks all patterns)</p>
                {report.patternMatch.outlierFactors.map((f, i) => (
                  <div key={i} className="text-xs flex gap-2 py-0.5">
                    <Sparkles className="h-3 w-3 text-purple-500 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            )}
          </MetricCard>
        )}
      </div>

      {/* Meta */}
      <div className="text-xs text-muted-foreground text-right">
        Generated {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : 'N/A'} | Model: {report.modelUsed || 'N/A'} | Data sources: {report.analysisDepth || 0}
      </div>
    </div>
  )
}
