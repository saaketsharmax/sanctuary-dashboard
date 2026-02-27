'use client'

import { Button } from '@sanctuary/ui'
import { useRef } from 'react'
import { Download, Printer } from 'lucide-react'
import type { StartupMemo } from '@/types'

interface MemoPDFProps {
  memo: StartupMemo
}

export function MemoPDF({ memo }: MemoPDFProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${memo.companyName} - Startup Memo</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 12px;
              line-height: 1.5;
              color: #1a1a1a;
              padding: 40px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 8px;
            }
            h2 {
              font-size: 18px;
              margin-top: 24px;
              margin-bottom: 12px;
              padding-bottom: 4px;
              border-bottom: 2px solid #1a1a1a;
            }
            h3 {
              font-size: 14px;
              margin-top: 16px;
              margin-bottom: 8px;
            }
            .meta {
              color: #666;
              font-size: 11px;
              margin-bottom: 24px;
            }
            .recommendation {
              display: inline-block;
              padding: 8px 16px;
              background: #f0f0f0;
              border-radius: 4px;
              font-weight: bold;
              margin-bottom: 16px;
            }
            .recommendation.accept { background: #dcfce7; color: #166534; }
            .recommendation.decline { background: #fef2f2; color: #991b1b; }
            .recommendation.conditional { background: #fef9c3; color: #854d0e; }
            .score-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 16px;
              margin: 16px 0;
            }
            .score-box {
              border: 1px solid #e5e5e5;
              padding: 12px;
              text-align: center;
            }
            .score-box .value {
              font-size: 24px;
              font-weight: bold;
            }
            .score-box .label {
              font-size: 10px;
              color: #666;
            }
            .section {
              margin-bottom: 24px;
            }
            .subsection {
              margin-left: 16px;
              margin-top: 8px;
            }
            ul {
              margin-left: 20px;
            }
            li {
              margin-bottom: 4px;
            }
            .risk {
              background: #fff7ed;
              border-left: 3px solid #ea580c;
              padding: 8px 12px;
              margin-bottom: 8px;
            }
            .risk.high {
              background: #fef2f2;
              border-left-color: #dc2626;
            }
            .risk.low {
              background: #f0fdf4;
              border-left-color: #16a34a;
            }
            .competitor {
              border: 1px solid #e5e5e5;
              padding: 8px 12px;
              margin-bottom: 8px;
            }
            .founder {
              border: 1px solid #e5e5e5;
              padding: 8px 12px;
              margin-bottom: 8px;
            }
            .tag {
              display: inline-block;
              background: #f0f0f0;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 10px;
              margin-right: 4px;
            }
            .page-break {
              page-break-before: always;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${generateMemoHTML(memo)}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="h-4 w-4 mr-2" />
        Print / Save PDF
      </Button>
    </div>
  )
}

function generateMemoHTML(memo: StartupMemo): string {
  const recommendationClass = memo.executiveSummary.recommendation.includes('accept')
    ? 'accept'
    : memo.executiveSummary.recommendation.includes('decline')
    ? 'decline'
    : 'conditional'

  return `
    <h1>${memo.companyName}</h1>
    <p class="meta">
      Startup Memo • Generated ${new Date(memo.generatedAt).toLocaleDateString()} • Version ${memo.version}
    </p>

    <div class="recommendation ${recommendationClass}">
      ${memo.executiveSummary.recommendation.replace(/_/g, ' ').toUpperCase()}
      (${Math.round(memo.executiveSummary.confidence * 100)}% confidence)
    </div>

    <h2>Executive Summary</h2>
    <div class="section">
      <p><strong>${memo.executiveSummary.oneLiner}</strong></p>
      <p style="margin-top: 12px">${memo.executiveSummary.keyThesis}</p>

      <h3>Critical Risks</h3>
      <ul>
        ${memo.executiveSummary.criticalRisks.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>

    <h2>Founder Profile</h2>
    <div class="section">
      <p>${memo.founderProfile.summary}</p>

      ${memo.founderProfile.backgrounds.map(f => `
        <div class="founder">
          <strong>${f.name}</strong> - ${f.role}
          ${f.validatedViaLinkedIn ? '<span class="tag">LinkedIn ✓</span>' : ''}
          <p>${f.background}</p>
          ${f.domainExpertise.map(e => `<span class="tag">${e}</span>`).join('')}
        </div>
      `).join('')}

      <h3>Team Dynamics</h3>
      <p>${memo.founderProfile.teamDynamics}</p>

      ${memo.founderProfile.gaps.length > 0 ? `
        <h3>Team Gaps</h3>
        <p>${memo.founderProfile.gaps.join(', ')}</p>
      ` : ''}

      <p style="margin-top: 12px"><strong>Founder Score: ${memo.founderProfile.score}/100</strong></p>
      <p>${memo.founderProfile.scoreReasoning}</p>
    </div>

    <h2>Problem & Market</h2>
    <div class="section">
      <h3>Problem Statement</h3>
      <p>${memo.problemAndMarket.problemStatement}</p>

      <h3>Ideal Customer Profile</h3>
      <p>${memo.problemAndMarket.icp.description}</p>
      <div class="subsection">
        <strong>Pain Points:</strong> ${memo.problemAndMarket.icp.painPoints.join(', ')}<br>
        <strong>Current Solutions:</strong> ${memo.problemAndMarket.icp.currentSolutions.join(', ')}<br>
        <strong>Willingness to Pay:</strong> ${memo.problemAndMarket.icp.willingnessToPay}
      </div>

      <h3>Market Size</h3>
      <div class="score-grid">
        <div class="score-box">
          <div class="value">${memo.problemAndMarket.marketSize.tam}</div>
          <div class="label">TAM</div>
        </div>
        <div class="score-box">
          <div class="value">${memo.problemAndMarket.marketSize.sam}</div>
          <div class="label">SAM</div>
        </div>
        <div class="score-box">
          <div class="value">${memo.problemAndMarket.marketSize.som}</div>
          <div class="label">SOM</div>
        </div>
      </div>
      <p><small>${memo.problemAndMarket.marketSize.methodology}</small></p>

      <h3>Validation Evidence</h3>
      <ul>
        ${memo.problemAndMarket.validationEvidence.map(e => `<li>${e}</li>`).join('')}
      </ul>

      <p style="margin-top: 12px"><strong>Problem Score: ${memo.problemAndMarket.score}/100</strong></p>
      <p>${memo.problemAndMarket.scoreReasoning}</p>
    </div>

    <div class="page-break"></div>

    <h2>Solution & Traction</h2>
    <div class="section">
      <p>${memo.solutionAndTraction.productDescription}</p>

      <h3>Differentiation</h3>
      <p>${memo.solutionAndTraction.differentiation.join(', ')}</p>

      <h3>Current Metrics</h3>
      <div class="score-grid">
        <div class="score-box">
          <div class="value">${memo.solutionAndTraction.currentMetrics.users ?? '—'}</div>
          <div class="label">Users</div>
        </div>
        <div class="score-box">
          <div class="value">${memo.solutionAndTraction.currentMetrics.mrr ? `$${memo.solutionAndTraction.currentMetrics.mrr}` : '—'}</div>
          <div class="label">MRR</div>
        </div>
        <div class="score-box">
          <div class="value" style="font-size: 14px">${memo.solutionAndTraction.currentMetrics.growth}</div>
          <div class="label">Growth</div>
        </div>
        <div class="score-box">
          <div class="value" style="font-size: 14px">${memo.solutionAndTraction.currentMetrics.retention}</div>
          <div class="label">Retention</div>
        </div>
      </div>

      <p><strong>Evidence Quality:</strong> ${memo.solutionAndTraction.evidenceQuality}</p>

      <p style="margin-top: 12px"><strong>User Value Score: ${memo.solutionAndTraction.score}/100</strong></p>
      <p>${memo.solutionAndTraction.scoreReasoning}</p>
    </div>

    <h2>Competitive Landscape</h2>
    <div class="section">
      <h3>Direct Competitors</h3>
      ${memo.competitiveLandscape.directCompetitors.map(c => `
        <div class="competitor">
          <strong>${c.name}</strong> - <span class="tag">${c.threatLevel} threat</span><br>
          ${c.description}<br>
          <small>Funding: ${c.funding} | vs. us: ${c.positioning}</small>
        </div>
      `).join('')}

      <h3>Indirect Alternatives</h3>
      <p>${memo.competitiveLandscape.indirectAlternatives.join(', ')}</p>

      <h3>Positioning & Advantage</h3>
      <p>${memo.competitiveLandscape.positioning}</p>
      <p><strong>Sustainable Advantage:</strong> ${memo.competitiveLandscape.sustainableAdvantage}</p>
    </div>

    <h2>Execution Assessment</h2>
    <div class="section">
      <p><strong>Shipping Velocity:</strong> ${memo.executionAssessment.shippingVelocity}</p>
      <p><strong>Decision Quality:</strong> ${memo.executionAssessment.decisionQuality}</p>
      <p><strong>Resource Efficiency:</strong> ${memo.executionAssessment.resourceEfficiency}</p>

      ${memo.executionAssessment.teamGaps.length > 0 ? `
        <h3>Execution Gaps</h3>
        <p>${memo.executionAssessment.teamGaps.join(', ')}</p>
      ` : ''}

      <p style="margin-top: 12px"><strong>Execution Score: ${memo.executionAssessment.score}/100</strong></p>
      <p>${memo.executionAssessment.scoreReasoning}</p>
    </div>

    <div class="page-break"></div>

    <h2>Risk Analysis</h2>
    <div class="section">
      ${memo.riskAnalysis.redFlags.length > 0 ? `
        <h3>Red Flags</h3>
        ${memo.riskAnalysis.redFlags.map(r => `
          <div class="risk ${r.severity}">
            <strong>${r.title}</strong> [${r.severity.toUpperCase()}]<br>
            ${r.description}
            ${r.mitigation ? `<br><small><em>Mitigation: ${r.mitigation}</em></small>` : ''}
          </div>
        `).join('')}
      ` : ''}

      ${memo.riskAnalysis.marketRisks.length > 0 ? `
        <h3>Market Risks</h3>
        ${memo.riskAnalysis.marketRisks.map(r => `
          <div class="risk ${r.severity}">
            <strong>${r.title}</strong> [${r.severity.toUpperCase()}]<br>
            ${r.description}
            ${r.mitigation ? `<br><small><em>Mitigation: ${r.mitigation}</em></small>` : ''}
          </div>
        `).join('')}
      ` : ''}

      ${memo.riskAnalysis.executionRisks.length > 0 ? `
        <h3>Execution Risks</h3>
        ${memo.riskAnalysis.executionRisks.map(r => `
          <div class="risk ${r.severity}">
            <strong>${r.title}</strong> [${r.severity.toUpperCase()}]<br>
            ${r.description}
            ${r.mitigation ? `<br><small><em>Mitigation: ${r.mitigation}</em></small>` : ''}
          </div>
        `).join('')}
      ` : ''}

      <h3>Mitigation Strategies</h3>
      <ul>
        ${memo.riskAnalysis.mitigationStrategies.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>

    <h2>Recommendation</h2>
    <div class="section">
      <div class="recommendation ${recommendationClass}" style="display: block; margin-bottom: 16px">
        ${memo.recommendation.decision}
      </div>

      <h3>Key Questions for Discussion</h3>
      <ul>
        ${memo.recommendation.keyQuestions.map(q => `<li>${q}</li>`).join('')}
      </ul>

      <h3>Suggested Next Steps</h3>
      <ol>
        ${memo.recommendation.suggestedNextSteps.map(s => `<li>${s}</li>`).join('')}
      </ol>
    </div>

    <h2>Appendix</h2>
    <div class="section">
      <h3>Signal Summary</h3>
      <p>
        Positive Signals: ${memo.appendix.signalsSummary.positiveSignals} |
        Negative Signals: ${memo.appendix.signalsSummary.negativeSignals} |
        Total Quotes: ${memo.appendix.signalsSummary.totalQuotes}
      </p>

      <h3>Strongest Signals</h3>
      <ul>
        ${memo.appendix.signalsSummary.strongestSignals.map(s => `<li>${s}</li>`).join('')}
      </ul>

      <h3>Research Sources</h3>
      <ul>
        ${memo.appendix.researchSources.slice(0, 5).map(s => `<li><small>${s}</small></li>`).join('')}
      </ul>
    </div>

    <hr style="margin-top: 40px; border: none; border-top: 1px solid #ccc">
    <p style="margin-top: 16px; color: #666; font-size: 10px; text-align: center">
      Generated by Sanctuary AI • ${new Date().toLocaleString()}
    </p>
  `
}

export default MemoPDF
