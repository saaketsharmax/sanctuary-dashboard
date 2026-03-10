// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY — Claim Extraction Zod Schema
// ═══════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

const claimSchema = z.object({
  category: z.enum([
    'revenue_metrics', 'user_customer', 'team_background', 'market_size',
    'competitive', 'technology_ip', 'customer_reference', 'traction', 'fundraising',
  ]),
  claimText: z.string(),
  sourceText: z.string(),
  sourceType: z.enum(['application_form', 'interview_transcript', 'research_data']),
  sourceReference: z.string(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  extractionConfidence: z.number(),
  benchmarkFlag: z.enum(['above_benchmark', 'below_benchmark', 'unrealistic']).nullable(),
})

const contradictionSchema = z.object({
  claimA: z.number(),
  claimB: z.number(),
  description: z.string(),
})

const omissionSchema = z.object({
  category: z.string(),
  expectedInfo: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  reasoning: z.string(),
})

export const claimExtractionOutputSchema = z.object({
  claims: z.array(claimSchema),
  contradictions: z.array(contradictionSchema),
  omissions: z.array(omissionSchema),
})
