-- =====================================================
-- Migration 010: DD Phase 1 — benchmark_flag + source_credibility_score
-- =====================================================

-- Benchmark flag on claims (above_benchmark, below_benchmark, unrealistic, null)
ALTER TABLE dd_claims
ADD COLUMN IF NOT EXISTS benchmark_flag TEXT;

-- Source credibility score on verifications (0.00–1.00)
ALTER TABLE dd_verifications
ADD COLUMN IF NOT EXISTS source_credibility_score DECIMAL(3,2);
