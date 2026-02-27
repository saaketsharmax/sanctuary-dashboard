-- ═══════════════════════════════════════════════════════════════════════════
-- SANCTUARY OS — Migration 009: Fix application status constraint + decision tracking
-- Unblocks: investment system (007/008), approval/rejection flow
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Drop the existing constraint (handle naming variations)
DO $$
BEGIN
  ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;
EXCEPTION WHEN OTHERS THEN
  NULL;
END
$$;

-- 2. Add new constraint with all statuses including approved/rejected/withdrawn
ALTER TABLE public.applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('draft', 'submitted', 'interviewing', 'under_review', 'approved', 'rejected', 'withdrawn'));

-- 3. Add decision tracking columns
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS decision_made_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS decision_notes TEXT;

-- 4. Indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_decision_made_at ON public.applications(decision_made_at);

-- 5. Ensure updated_at trigger exists
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
