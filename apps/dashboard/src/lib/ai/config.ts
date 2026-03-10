// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY AI — Shared Configuration
// Single source of truth for model, provider, and agent settings
// ═══════════════════════════════════════════════════════════════════════════

import { anthropic } from '@ai-sdk/anthropic'

// ─── Model Tiers ──────────────────────────────────────────────────────────

export const MODEL_TIERS = {
  reasoning: 'claude-sonnet-4-20250514',     // $3/$15 per MTok — nuanced reasoning, user-facing
  extraction: 'claude-haiku-4-5-20251001',   // $1/$5 per MTok — structured extraction, matching
} as const

export const SANCTUARY_MODEL_ID = MODEL_TIERS.reasoning

export function getModel(tier: keyof typeof MODEL_TIERS = 'reasoning') {
  return anthropic(MODEL_TIERS[tier])
}

// ─── Token Limits ────────────────────────────────────────────────────────

export const MAX_TOKENS = {
  conversational: 1024,   // Interview, voice
  analysis: 4096,         // Assessment, claims, matchmaking, programme
  deep: 6144,             // Memo, God Mode DD (was 8192)
  summary: 2048,          // DD report exec summary (was 3072)
  voice: 256,             // Voice interview TTS responses
} as const

// ─── Prompt Caching ──────────────────────────────────────────────────────
// Anthropic ephemeral cache: cached input tokens cost $0.30/MTok vs $3/MTok
// System prompts are cached server-side for 5 minutes

export const ANTHROPIC_CACHE_OPTIONS = {
  anthropic: { cacheControl: { type: 'ephemeral' as const } },
} as const

// ─── Agent Metadata Helper ───────────────────────────────────────────────

export function createAgentMetadata(startTime: number) {
  return {
    model: SANCTUARY_MODEL_ID,
    processingTimeMs: Date.now() - startTime,
    generatedAt: new Date().toISOString(),
  }
}
