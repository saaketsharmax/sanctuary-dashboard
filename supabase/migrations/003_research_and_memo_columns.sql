-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Research and Memo Columns
-- Version: 003
-- Date: 2026-02-07
-- Description: Adds research_data and memo_data columns to applications table
-- ═══════════════════════════════════════════════════════════════════════════

-- Add research data columns
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS research_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS research_completed_at TIMESTAMPTZ;

-- Add memo data columns
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS memo_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS memo_generated_at TIMESTAMPTZ;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_research_completed
ON public.applications (research_completed_at)
WHERE research_completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_applications_memo_generated
ON public.applications (memo_generated_at)
WHERE memo_generated_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.applications.research_data IS 'JSON object containing external research data (competitors, market analysis, founder validation)';
COMMENT ON COLUMN public.applications.research_completed_at IS 'Timestamp when research was completed';
COMMENT ON COLUMN public.applications.memo_data IS 'JSON object containing the generated startup memo';
COMMENT ON COLUMN public.applications.memo_generated_at IS 'Timestamp when memo was generated';

-- ═══════════════════════════════════════════════════════════════════════════
-- Agent Runs Extension (for tracking research and memo generation)
-- ═══════════════════════════════════════════════════════════════════════════

-- Add new agent types to track research and memo generation
-- Note: This assumes agent_runs table exists from migration 002

-- If agent_runs doesn't have a type constraint, we can add new values
-- The table should already support: 'interview', 'assessment'
-- We're adding: 'research', 'memo_generation'

-- If agent_runs exists, add an index for the new agent types
CREATE INDEX IF NOT EXISTS idx_agent_runs_type_application
ON public.agent_runs (agent_type, application_id)
WHERE agent_type IN ('research', 'memo_generation');

-- ═══════════════════════════════════════════════════════════════════════════
-- Views for Partner Dashboard
-- ═══════════════════════════════════════════════════════════════════════════

-- View to show applications with memo status
CREATE OR REPLACE VIEW public.applications_with_memo_status AS
SELECT
  a.*,
  CASE
    WHEN a.memo_generated_at IS NOT NULL THEN 'memo_ready'
    WHEN a.research_completed_at IS NOT NULL THEN 'research_complete'
    WHEN a.status = 'assessment_generated' THEN 'ready_for_research'
    ELSE a.status
  END AS pipeline_status,
  EXTRACT(EPOCH FROM (a.memo_generated_at - a.research_completed_at)) AS research_to_memo_seconds
FROM public.applications a;

-- Grant access to authenticated users
GRANT SELECT ON public.applications_with_memo_status TO authenticated;
