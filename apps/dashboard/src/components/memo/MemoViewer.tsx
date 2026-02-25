'use client'

import {
  Badge,
  Button,
  Separator,
  cn,
} from '@sanctuary/ui'
import {
  MemoSection,
  ScoreDisplay,
  RiskItem,
  CompetitorCard,
  FounderCard,
} from './MemoSection'
import {
  FileText,
  Users,
  Target,
  Rocket,
  Swords,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
} from 'lucide-react'
import type { StartupMemo } from '@/types'
interface MemoViewerProps {
  memo: StartupMemo
  onExportPDF?: () => void
}

export function MemoViewer({ memo, onExportPDF }: MemoViewerProps) {
  const recommendationColors: Record<string, string> = {
    strong_accept: 'bg-success/15 text-success border-success/40',
    accept: 'bg-info/15 text-info border-info/40',
    conditional: 'bg-warning/15 text-warning border-warning/40',
    lean_decline: 'bg-warning/15 text-warning border-warning/40',
    decline: 'bg-destructive/15 text-destructive border-destructive/40',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{memo.companyName} — Startup Memo</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generated {new Date(memo.generatedAt).toLocaleString()} • Version {memo.version}
          </p>
        </div>
        {onExportPDF && (
          <Button variant="outline" onClick={onExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        )}
      </div>

      {/* Executive Summary */}
      <MemoSection
        title="Executive Summary"
        badge={memo.executiveSummary.recommendation.replace(/_/g, ' ').toUpperCase()}
        badgeVariant={
          memo.executiveSummary.recommendation.includes('accept') ? 'default' : 'destructive'
        }
      >
        <div className="space-y-4">
          <p className="text-lg font-medium">{memo.executiveSummary.oneLiner}</p>

          <div className="flex items-center gap-4">
            <div
              className={cn(
                'px-4 py-2 rounded-lg border',
                recommendationColors[memo.executiveSummary.recommendation]
              )}
            >
              <span className="font-semibold">
                {memo.executiveSummary.recommendation.replace(/_/g, ' ').toUpperCase()}
              </span>
              <span className="ml-2 text-sm">
                ({Math.round(memo.executiveSummary.confidence * 100)}% confidence)
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-1">Investment Thesis</h4>
            <p className="text-sm text-muted-foreground">{memo.executiveSummary.keyThesis}</p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Critical Risks</h4>
            <ul className="space-y-1">
              {memo.executiveSummary.criticalRisks.map((risk, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MemoSection>

      {/* Founder Profile */}
      <MemoSection
        title="Founder Profile"
        badge={`Score: ${memo.founderProfile.score}/100`}
        collapsible
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{memo.founderProfile.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {memo.founderProfile.backgrounds.map((founder, i) => (
              <FounderCard
                key={i}
                name={founder.name}
                role={founder.role}
                background={founder.background}
                expertise={founder.domainExpertise}
                validated={founder.validatedViaLinkedIn}
              />
            ))}
          </div>

          <div>
            <h4 className="font-medium text-sm mb-1">Team Dynamics</h4>
            <p className="text-sm text-muted-foreground">{memo.founderProfile.teamDynamics}</p>
          </div>

          {memo.founderProfile.gaps.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Team Gaps</h4>
              <div className="flex flex-wrap gap-2">
                {memo.founderProfile.gaps.map((gap, i) => (
                  <Badge key={i} variant="outline" className="text-warning border-warning/40">
                    {gap}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <ScoreDisplay
            label="Founder Score"
            score={memo.founderProfile.score}
            reasoning={memo.founderProfile.scoreReasoning}
          />
        </div>
      </MemoSection>

      {/* Problem & Market */}
      <MemoSection
        title="Problem & Market"
        badge={`Score: ${memo.problemAndMarket.score}/100`}
        collapsible
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-1">Problem Statement</h4>
            <p className="text-sm text-muted-foreground">{memo.problemAndMarket.problemStatement}</p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-1">Ideal Customer Profile</h4>
            <p className="text-sm text-muted-foreground mb-2">
              {memo.problemAndMarket.icp.description}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Pain Points:</span>
                <ul className="mt-1 space-y-1">
                  {memo.problemAndMarket.icp.painPoints.map((p, i) => (
                    <li key={i} className="text-muted-foreground">• {p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-medium">Current Solutions:</span>
                <ul className="mt-1 space-y-1">
                  {memo.problemAndMarket.icp.currentSolutions.map((s, i) => (
                    <li key={i} className="text-muted-foreground">• {s}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm mt-2">
              <span className="font-medium">Willingness to Pay:</span>{' '}
              <span className="text-muted-foreground">
                {memo.problemAndMarket.icp.willingnessToPay}
              </span>
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Market Size</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="border rounded-lg p-3 text-center">
                <div className="text-lg font-bold">{memo.problemAndMarket.marketSize.tam}</div>
                <div className="text-xs text-muted-foreground">TAM</div>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <div className="text-lg font-bold">{memo.problemAndMarket.marketSize.sam}</div>
                <div className="text-xs text-muted-foreground">SAM</div>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <div className="text-lg font-bold">{memo.problemAndMarket.marketSize.som}</div>
                <div className="text-xs text-muted-foreground">SOM</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Methodology: {memo.problemAndMarket.marketSize.methodology}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Validation Evidence</h4>
            <ul className="space-y-1">
              {memo.problemAndMarket.validationEvidence.map((e, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>

          <ScoreDisplay
            label="Problem Score"
            score={memo.problemAndMarket.score}
            reasoning={memo.problemAndMarket.scoreReasoning}
          />
        </div>
      </MemoSection>

      {/* Solution & Traction */}
      <MemoSection
        title="Solution & Traction"
        badge={`Score: ${memo.solutionAndTraction.score}/100`}
        collapsible
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-1">Product Description</h4>
            <p className="text-sm text-muted-foreground">
              {memo.solutionAndTraction.productDescription}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Differentiation</h4>
            <div className="flex flex-wrap gap-2">
              {memo.solutionAndTraction.differentiation.map((d, i) => (
                <Badge key={i} variant="secondary">
                  {d}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Current Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="border rounded-lg p-3 text-center">
                <div className="text-lg font-bold">
                  {memo.solutionAndTraction.currentMetrics.users ?? '—'}
                </div>
                <div className="text-xs text-muted-foreground">Users</div>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <div className="text-lg font-bold">
                  {memo.solutionAndTraction.currentMetrics.mrr
                    ? `$${memo.solutionAndTraction.currentMetrics.mrr}`
                    : '—'}
                </div>
                <div className="text-xs text-muted-foreground">MRR</div>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <div className="text-sm font-medium">
                  {memo.solutionAndTraction.currentMetrics.growth}
                </div>
                <div className="text-xs text-muted-foreground">Growth</div>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <div className="text-sm font-medium">
                  {memo.solutionAndTraction.currentMetrics.retention}
                </div>
                <div className="text-xs text-muted-foreground">Retention</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-1">Evidence Quality</h4>
            <p className="text-sm text-muted-foreground">
              {memo.solutionAndTraction.evidenceQuality}
            </p>
          </div>

          <ScoreDisplay
            label="User Value Score"
            score={memo.solutionAndTraction.score}
            reasoning={memo.solutionAndTraction.scoreReasoning}
          />
        </div>
      </MemoSection>

      {/* Competitive Landscape */}
      <MemoSection title="Competitive Landscape" collapsible>
        <div className="space-y-4">
          {memo.competitiveLandscape.directCompetitors.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Direct Competitors</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {memo.competitiveLandscape.directCompetitors.map((c, i) => (
                  <CompetitorCard
                    key={i}
                    name={c.name}
                    description={c.description}
                    funding={c.funding}
                    positioning={c.positioning}
                    threatLevel={c.threatLevel}
                  />
                ))}
              </div>
            </div>
          )}

          {memo.competitiveLandscape.indirectAlternatives.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Indirect Alternatives</h4>
              <div className="flex flex-wrap gap-2">
                {memo.competitiveLandscape.indirectAlternatives.map((a, i) => (
                  <Badge key={i} variant="outline">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium text-sm mb-1">Positioning</h4>
            <p className="text-sm text-muted-foreground">
              {memo.competitiveLandscape.positioning}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-1">Sustainable Advantage</h4>
            <p className="text-sm text-muted-foreground">
              {memo.competitiveLandscape.sustainableAdvantage}
            </p>
          </div>
        </div>
      </MemoSection>

      {/* Execution Assessment */}
      <MemoSection
        title="Execution Assessment"
        badge={`Score: ${memo.executionAssessment.score}/100`}
        collapsible
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-1">Shipping Velocity</h4>
              <p className="text-sm text-muted-foreground">
                {memo.executionAssessment.shippingVelocity}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Decision Quality</h4>
              <p className="text-sm text-muted-foreground">
                {memo.executionAssessment.decisionQuality}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Resource Efficiency</h4>
              <p className="text-sm text-muted-foreground">
                {memo.executionAssessment.resourceEfficiency}
              </p>
            </div>
          </div>

          {memo.executionAssessment.teamGaps.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Execution Gaps</h4>
              <div className="flex flex-wrap gap-2">
                {memo.executionAssessment.teamGaps.map((gap, i) => (
                  <Badge key={i} variant="outline" className="text-warning border-warning/40">
                    {gap}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <ScoreDisplay
            label="Execution Score"
            score={memo.executionAssessment.score}
            reasoning={memo.executionAssessment.scoreReasoning}
          />
        </div>
      </MemoSection>

      {/* Risk Analysis */}
      <MemoSection title="Risk Analysis" collapsible>
        <div className="space-y-6">
          {memo.riskAnalysis.redFlags.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2 text-destructive">Red Flags</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {memo.riskAnalysis.redFlags.map((r, i) => (
                  <RiskItem
                    key={i}
                    title={r.title}
                    description={r.description}
                    severity={r.severity}
                    source={r.source}
                    mitigation={r.mitigation}
                  />
                ))}
              </div>
            </div>
          )}

          {memo.riskAnalysis.marketRisks.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Market Risks</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {memo.riskAnalysis.marketRisks.map((r, i) => (
                  <RiskItem
                    key={i}
                    title={r.title}
                    description={r.description}
                    severity={r.severity}
                    source={r.source}
                    mitigation={r.mitigation}
                  />
                ))}
              </div>
            </div>
          )}

          {memo.riskAnalysis.executionRisks.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Execution Risks</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {memo.riskAnalysis.executionRisks.map((r, i) => (
                  <RiskItem
                    key={i}
                    title={r.title}
                    description={r.description}
                    severity={r.severity}
                    source={r.source}
                    mitigation={r.mitigation}
                  />
                ))}
              </div>
            </div>
          )}

          {memo.riskAnalysis.mitigationStrategies.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Mitigation Strategies</h4>
              <ul className="space-y-1">
                {memo.riskAnalysis.mitigationStrategies.map((s, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <Zap className="h-4 w-4 text-info mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </MemoSection>

      {/* Recommendation */}
      <MemoSection
        title="Recommendation"
        badge={`${Math.round(memo.recommendation.confidence * 100)}% Confidence`}
      >
        <div className="space-y-4">
          <div
            className={cn(
              'p-4 rounded-lg border-2',
              recommendationColors[memo.executiveSummary.recommendation]
            )}
          >
            <p className="font-medium">{memo.recommendation.decision}</p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Key Questions for Discussion</h4>
            <ul className="space-y-1">
              {memo.recommendation.keyQuestions.map((q, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Suggested Next Steps</h4>
            <ul className="space-y-1">
              {memo.recommendation.suggestedNextSteps.map((s, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="font-medium text-info">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MemoSection>

      {/* Appendix */}
      <MemoSection title="Appendix" collapsible defaultOpen={false}>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Signal Summary</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="border rounded-lg p-3">
                <div className="text-lg font-bold text-success">
                  {memo.appendix.signalsSummary.positiveSignals}
                </div>
                <div className="text-xs text-muted-foreground">Positive</div>
              </div>
              <div className="border rounded-lg p-3">
                <div className="text-lg font-bold text-destructive">
                  {memo.appendix.signalsSummary.negativeSignals}
                </div>
                <div className="text-xs text-muted-foreground">Negative</div>
              </div>
              <div className="border rounded-lg p-3">
                <div className="text-lg font-bold">
                  {memo.appendix.signalsSummary.totalQuotes}
                </div>
                <div className="text-xs text-muted-foreground">Total Quotes</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Strongest Signals</h4>
            <ul className="space-y-1">
              {memo.appendix.signalsSummary.strongestSignals.map((s, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {memo.appendix.researchSources.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Research Sources</h4>
              <ul className="space-y-1">
                {memo.appendix.researchSources.slice(0, 5).map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground truncate">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </MemoSection>
    </div>
  )
}
