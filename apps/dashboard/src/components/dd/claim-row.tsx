'use client'

import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { ClaimStatusBadge, ClaimPriorityBadge, VerificationVerdictBadge } from './verification-badge'
import { DD_CATEGORY_LABELS } from '@/lib/ai/types/due-diligence'
import type { DDClaim, DDBenchmarkFlag } from '@/lib/ai/types/due-diligence'

interface ClaimRowProps {
  claim: DDClaim
}

export function ClaimRow({ claim }: ClaimRowProps) {
  const [open, setOpen] = useState(false)
  const verificationCount = claim.verifications?.length || 0

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer rounded-lg border">
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{claim.claimText}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {DD_CATEGORY_LABELS[claim.category] || claim.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                from {claim.sourceType.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {claim.benchmarkFlag && (
              <BenchmarkBadge flag={claim.benchmarkFlag} />
            )}
            <ClaimPriorityBadge priority={claim.priority} />
            <ClaimStatusBadge status={claim.status} />
            {verificationCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {verificationCount} source{verificationCount !== 1 ? 's' : ''}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground w-10 text-right">
              {Math.round((claim.extractionConfidence || 0) * 100)}%
            </span>
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="ml-7 p-3 space-y-3 border-l-2 border-muted">
          {/* Source text */}
          <div>
            <p className="text-xs font-medium text-muted-foreground">Source Quote</p>
            <p className="text-sm italic mt-0.5">&ldquo;{claim.sourceText}&rdquo;</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Reference: {claim.sourceReference}
            </p>
          </div>

          {/* Confidence */}
          {claim.verificationConfidence !== null && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Verification Confidence</p>
              <p className="text-sm">{Math.round(claim.verificationConfidence * 100)}%</p>
            </div>
          )}

          {/* Verifications */}
          {claim.verifications && claim.verifications.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Verification Sources</p>
              {claim.verifications.map((v, idx) => (
                <div key={idx} className="p-2 bg-muted/30 rounded text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <VerificationVerdictBadge verdict={v.verdict} />
                    <span className="text-xs text-muted-foreground">{v.sourceName}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round(v.confidence * 100)}% confidence)
                    </span>
                  </div>
                  <p className="text-xs">{v.evidence}</p>
                  {v.evidenceUrls.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {v.evidenceUrls.map((url, urlIdx) => (
                        <a
                          key={urlIdx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-0.5"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Source {urlIdx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                  {v.notes && (
                    <p className="text-xs text-muted-foreground">{v.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Contradictions */}
          {claim.contradicts.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-600">
                Contradicts {claim.contradicts.length} other claim(s)
              </p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// ─── Benchmark Badge ───

const benchmarkConfig: Record<string, { label: string; className: string }> = {
  above_benchmark: { label: 'Above Benchmark', className: 'bg-green-100 text-green-600' },
  below_benchmark: { label: 'Below Benchmark', className: 'bg-yellow-100 text-yellow-600' },
  unrealistic: { label: 'Unrealistic', className: 'bg-red-100 text-red-600' },
}

function BenchmarkBadge({ flag }: { flag: NonNullable<DDBenchmarkFlag> }) {
  const config = benchmarkConfig[flag]
  if (!config) return null
  return <Badge className={`${config.className} text-xs`}>{config.label}</Badge>
}
