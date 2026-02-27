-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 011: DD Phase 2 — Team/Market Assessment + Outcome Tracking
-- ═══════════════════════════════════════════════════════════════════════════
-- Team and market assessment data is stored in dd_reports.report_data JSONB
-- (no new columns needed for those).
-- This migration adds outcome tracking columns to applications for the
-- future Pattern Agent, and adds dd_team_assessment to the agent_runs
-- check constraint.
-- ═══════════════════════════════════════════════════════════════════════════

-- Outcome tracking for Pattern Agent (start collecting data now)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS outcome TEXT;
-- Values: 'active', 'graduated', 'failed', 'acquired', 'ipo', null

ALTER TABLE applications ADD COLUMN IF NOT EXISTS outcome_notes TEXT;

ALTER TABLE applications ADD COLUMN IF NOT EXISTS outcome_updated_at TIMESTAMPTZ;

-- Update agent_runs check constraint to include new agent types
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'agent_runs'
  ) THEN
    -- Drop existing constraint if it exists
    ALTER TABLE agent_runs DROP CONSTRAINT IF EXISTS agent_runs_agent_type_check;
    -- Add updated constraint with new agent types
    ALTER TABLE agent_runs ADD CONSTRAINT agent_runs_agent_type_check
      CHECK (agent_type IN (
        'interview',
        'assessment',
        'research',
        'memo_generation',
        'dd_claim_extraction',
        'dd_claim_verification',
        'dd_document_verification',
        'dd_report_generation',
        'dd_team_assessment',
        'dd_market_assessment',
        'dd_finance_assessment',
        'dd_pattern_assessment'
      ));
  END IF;
END $$;
