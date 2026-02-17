-- ═══════════════════════════════════════════════════════════════════════════
-- SANCTUARY OS — Due Diligence Schema
-- Migration 005: DD Claims, Verifications, Reports
-- ═══════════════════════════════════════════════════════════════════════════

-- DD CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.dd_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'revenue_metrics', 'user_customer', 'team_background', 'market_size',
    'competitive', 'technology_ip', 'customer_reference', 'traction', 'fundraising'
  )),
  claim_text TEXT NOT NULL,
  source_text TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('application_form', 'interview_transcript', 'research_data')),
  source_reference TEXT,
  status TEXT NOT NULL DEFAULT 'unverified' CHECK (status IN (
    'unverified', 'ai_verified', 'mentor_verified', 'disputed', 'confirmed', 'refuted', 'unverifiable'
  )),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  extraction_confidence DECIMAL(3,2) NOT NULL DEFAULT 0.5,
  verification_confidence DECIMAL(3,2),
  contradicts UUID[] DEFAULT '{}',
  corroborates UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dd_claims_application ON public.dd_claims(application_id);
CREATE INDEX IF NOT EXISTS idx_dd_claims_category ON public.dd_claims(category);
CREATE INDEX IF NOT EXISTS idx_dd_claims_status ON public.dd_claims(status);
CREATE INDEX IF NOT EXISTS idx_dd_claims_priority ON public.dd_claims(priority);

ALTER TABLE public.dd_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view all claims" ON public.dd_claims
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

CREATE POLICY "System can insert claims" ON public.dd_claims
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update claims" ON public.dd_claims
  FOR UPDATE USING (true);

-- DD VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.dd_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES public.dd_claims(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('ai_research', 'document_analysis', 'mentor_review', 'reference_check')),
  source_name TEXT NOT NULL,
  source_credentials TEXT,
  verdict TEXT NOT NULL CHECK (verdict IN ('confirmed', 'partially_confirmed', 'unconfirmed', 'disputed', 'refuted')),
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.5,
  evidence TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dd_verifications_claim ON public.dd_verifications(claim_id);
CREATE INDEX IF NOT EXISTS idx_dd_verifications_verdict ON public.dd_verifications(verdict);

ALTER TABLE public.dd_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view all verifications" ON public.dd_verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

CREATE POLICY "System can insert verifications" ON public.dd_verifications
  FOR INSERT WITH CHECK (true);

-- DD REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.dd_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  overall_dd_score INTEGER NOT NULL DEFAULT 0,
  dd_grade TEXT NOT NULL DEFAULT 'F' CHECK (dd_grade IN ('A', 'B', 'C', 'D', 'F')),
  total_claims INTEGER NOT NULL DEFAULT 0,
  verified_claims INTEGER NOT NULL DEFAULT 0,
  refuted_claims INTEGER NOT NULL DEFAULT 0,
  verification_coverage DECIMAL(3,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dd_reports_application ON public.dd_reports(application_id);

ALTER TABLE public.dd_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view all reports" ON public.dd_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

CREATE POLICY "System can insert reports" ON public.dd_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update reports" ON public.dd_reports
  FOR UPDATE USING (true);

-- ADD DD COLUMNS TO APPLICATIONS TABLE
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS dd_status TEXT DEFAULT 'not_started' CHECK (dd_status IN ('not_started', 'claims_extracted', 'ai_verification', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS dd_report_id UUID REFERENCES public.dd_reports(id),
ADD COLUMN IF NOT EXISTS dd_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS dd_completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_applications_dd_status ON public.applications(dd_status);

-- UPDATE TRIGGERS
DROP TRIGGER IF EXISTS update_dd_claims_updated_at ON public.dd_claims;
CREATE TRIGGER update_dd_claims_updated_at BEFORE UPDATE ON public.dd_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_dd_reports_updated_at ON public.dd_reports;
CREATE TRIGGER update_dd_reports_updated_at BEFORE UPDATE ON public.dd_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ADD DD AGENT TYPES TO AGENT_RUNS CHECK CONSTRAINT
-- We need to drop and recreate the check since ALTER CHECK isn't supported
ALTER TABLE public.agent_runs DROP CONSTRAINT IF EXISTS agent_runs_agent_type_check;
ALTER TABLE public.agent_runs ADD CONSTRAINT agent_runs_agent_type_check
  CHECK (agent_type IN (
    'interview', 'assessment', 'programme', 'matching', 'research',
    'calibration', 'memo_generation',
    'dd_claim_extraction', 'dd_claim_verification', 'dd_document_verification', 'dd_report_generation'
  ));
