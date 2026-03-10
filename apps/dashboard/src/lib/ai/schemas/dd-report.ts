// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY — DD Report Executive Summary Zod Schema
// Only the AI-generated portion; scoring is deterministic
// ═══════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

export const ddExecSummaryOutputSchema = z.object({
  executiveSummary: z.string(),
  followUpQuestions: z.array(z.object({
    category: z.string(),
    question: z.string(),
    reason: z.string(),
    priority: z.enum(['critical', 'high', 'medium', 'low']),
  })),
  recommendationConditions: z.array(z.string()),
  recommendationReasoning: z.string(),
})
