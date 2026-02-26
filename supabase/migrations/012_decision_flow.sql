-- ═══════════════════════════════════════════════════════════════════════════
-- SANCTUARY OS — Migration 012: Decision Flow Support
-- Ensures startups table supports auto-creation on approval
-- Adds application_id reference to startups
-- Updates agent_runs for new agent types
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Add application_id to startups for linking
ALTER TABLE public.startups
  ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES public.applications(id);

CREATE INDEX IF NOT EXISTS idx_startups_application_id ON public.startups(application_id);

-- 2. Update agent_runs constraint to support new agent types
DO $$
BEGIN
  ALTER TABLE public.agent_runs DROP CONSTRAINT IF EXISTS agent_runs_agent_type_check;
EXCEPTION WHEN OTHERS THEN
  NULL;
END
$$;

ALTER TABLE public.agent_runs ADD CONSTRAINT agent_runs_agent_type_check
  CHECK (agent_type IN (
    'interview', 'assessment', 'research', 'memo', 'programme',
    'claim_extraction', 'claim_verification', 'document_verification',
    'dd_report', 'dd_team_assessment', 'dd_market_assessment',
    'dd_finance_assessment', 'dd_pattern_assessment',
    'god_mode_dd', 'voice_interview', 'matchmaking', 'dd_accuracy',
    'calibration'
  ));

-- 3. Add outcome tracking to applications (for accuracy metrics)
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS outcome TEXT,
  ADD COLUMN IF NOT EXISTS outcome_notes TEXT,
  ADD COLUMN IF NOT EXISTS outcome_updated_at TIMESTAMPTZ;

-- 4. RLS: Allow partners to update application status (for decision endpoint)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Partners can update application status" ON public.applications;
  CREATE POLICY "Partners can update application status" ON public.applications
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.user_type = 'partner'
      )
    );
EXCEPTION WHEN OTHERS THEN
  NULL;
END
$$;

-- 5. RLS: Allow system to create startups on approval
DO $$
BEGIN
  DROP POLICY IF EXISTS "System can create startups" ON public.startups;
  CREATE POLICY "System can create startups" ON public.startups
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  NULL;
END
$$;
