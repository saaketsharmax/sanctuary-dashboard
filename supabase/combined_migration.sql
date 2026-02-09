-- ═══════════════════════════════════════════════════════════════════════════
-- SANCTUARY OS — COMPLETE DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 1: BASE SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('founder', 'partner')),
  partner_sub_type TEXT CHECK (partner_sub_type IN ('mentor', 'vc', 'startup_manager')),
  startup_id UUID,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STARTUPS TABLE
CREATE TABLE IF NOT EXISTS public.startups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  one_liner TEXT,
  description TEXT,
  website TEXT,
  stage TEXT CHECK (stage IN ('idea', 'prototype', 'mvp', 'early_revenue', 'growth')),
  industry TEXT,
  founded_date DATE,
  logo_url TEXT,
  location TEXT,
  problem TEXT,
  solution TEXT,
  target_customer TEXT,
  cohort TEXT,
  residency_start DATE,
  residency_end DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'interviewing', 'accepted', 'rejected', 'active', 'graduated', 'inactive')),
  cohort_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;

-- Add foreign key to users after startups exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_users_startup'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT fk_users_startup
      FOREIGN KEY (startup_id) REFERENCES public.startups(id);
  END IF;
END $$;

-- Founders can view their own startup
CREATE POLICY "Users can view own startup" ON public.startups
  FOR SELECT USING (
    id IN (SELECT startup_id FROM public.users WHERE id = auth.uid())
  );

-- Founders can update their own startup
CREATE POLICY "Users can update own startup" ON public.startups
  FOR UPDATE USING (
    id IN (SELECT startup_id FROM public.users WHERE id = auth.uid())
  );

-- Partners can view all startups
CREATE POLICY "Partners can view all startups" ON public.startups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id UUID REFERENCES public.startups(id),
  user_id UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'interviewing', 'interview_complete', 'assessment_generated', 'under_review', 'accepted', 'rejected')),
  company_name TEXT NOT NULL,
  company_one_liner TEXT,
  company_website TEXT,
  company_description TEXT,
  problem_description TEXT,
  target_customer TEXT,
  solution_description TEXT,
  stage TEXT,
  user_count INTEGER DEFAULT 0,
  mrr DECIMAL(12,2) DEFAULT 0,
  biggest_challenge TEXT,
  why_sanctuary TEXT,
  what_they_want TEXT,
  founders JSONB DEFAULT '[]'::jsonb,
  interview_started_at TIMESTAMPTZ,
  interview_completed_at TIMESTAMPTZ,
  interview_transcript JSONB,
  ai_assessment JSONB,
  ai_score DECIMAL(3,2),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON public.applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON public.applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Partners can view all applications" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

CREATE POLICY "Partners can update applications" ON public.applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- Allow unauthenticated inserts for public application form
CREATE POLICY "Anyone can insert applications" ON public.applications
  FOR INSERT WITH CHECK (true);

-- Allow unauthenticated updates for interview flow
CREATE POLICY "Anyone can update applications" ON public.applications
  FOR UPDATE USING (true);

-- MENTORS TABLE
CREATE TABLE IF NOT EXISTS public.mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  name TEXT NOT NULL,
  email TEXT,
  title TEXT,
  company TEXT,
  bio TEXT,
  avatar_url TEXT,
  expertise TEXT[] DEFAULT '{}',
  industries TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'limited', 'unavailable')),
  max_mentees INTEGER DEFAULT 3,
  current_mentees INTEGER DEFAULT 0,
  linkedin_url TEXT,
  calendly_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mentors" ON public.mentors
  FOR SELECT USING (true);

-- MENTOR MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.mentor_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id UUID REFERENCES public.startups(id),
  mentor_id UUID REFERENCES public.mentors(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'active', 'completed')),
  match_score DECIMAL(3,2),
  match_reasons JSONB,
  requested_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mentor_matches ENABLE ROW LEVEL SECURITY;

-- CHECKPOINTS TABLE
CREATE TABLE IF NOT EXISTS public.checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id UUID REFERENCES public.startups(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;

-- Founders can view their checkpoints
CREATE POLICY "Founders can view own checkpoints" ON public.checkpoints
  FOR SELECT USING (
    startup_id IN (SELECT startup_id FROM public.users WHERE id = auth.uid())
  );

-- Founders can update their checkpoints
CREATE POLICY "Founders can update own checkpoints" ON public.checkpoints
  FOR UPDATE USING (
    startup_id IN (SELECT startup_id FROM public.users WHERE id = auth.uid())
  );

-- Partners can view all checkpoints
CREATE POLICY "Partners can view all checkpoints" ON public.checkpoints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- METRICS TABLE
CREATE TABLE IF NOT EXISTS public.metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id UUID REFERENCES public.startups(id),
  date DATE NOT NULL,
  mrr DECIMAL(12,2),
  arr DECIMAL(12,2),
  active_users INTEGER,
  total_users INTEGER,
  churn_rate DECIMAL(5,2),
  burn_rate DECIMAL(12,2),
  runway_months INTEGER,
  nps_score INTEGER,
  custom_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

-- Founders can view their metrics
CREATE POLICY "Founders can view own metrics" ON public.metrics
  FOR SELECT USING (
    startup_id IN (SELECT startup_id FROM public.users WHERE id = auth.uid())
  );

-- Partners can view all metrics
CREATE POLICY "Partners can view all metrics" ON public.metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id UUID REFERENCES public.startups(id),
  uploaded_by UUID REFERENCES public.users(id),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('pitch_deck', 'financials', 'legal', 'product', 'other')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  version INTEGER DEFAULT 1,
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Founders can view their documents
CREATE POLICY "Founders can view own documents" ON public.documents
  FOR SELECT USING (
    startup_id IN (SELECT startup_id FROM public.users WHERE id = auth.uid())
  );

-- Founders can insert documents
CREATE POLICY "Founders can insert documents" ON public.documents
  FOR INSERT WITH CHECK (
    startup_id IN (SELECT startup_id FROM public.users WHERE id = auth.uid())
  );

-- Founders can update their documents
CREATE POLICY "Founders can update own documents" ON public.documents
  FOR UPDATE USING (
    startup_id IN (SELECT startup_id FROM public.users WHERE id = auth.uid())
  );

-- Founders can delete their documents
CREATE POLICY "Founders can delete own documents" ON public.documents
  FOR DELETE USING (
    startup_id IN (SELECT startup_id FROM public.users WHERE id = auth.uid())
  );

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_startups_updated_at ON public.startups;
CREATE TRIGGER update_startups_updated_at BEFORE UPDATE ON public.startups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_mentors_updated_at ON public.mentors;
CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON public.mentors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_mentor_matches_updated_at ON public.mentor_matches;
CREATE TRIGGER update_mentor_matches_updated_at BEFORE UPDATE ON public.mentor_matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_checkpoints_updated_at ON public.checkpoints;
CREATE TRIGGER update_checkpoints_updated_at BEFORE UPDATE ON public.checkpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_startups_status ON public.startups(status);
CREATE INDEX IF NOT EXISTS idx_metrics_startup_date ON public.metrics(startup_id, date);
CREATE INDEX IF NOT EXISTS idx_checkpoints_startup ON public.checkpoints(startup_id);
CREATE INDEX IF NOT EXISTS idx_mentor_matches_startup ON public.mentor_matches(startup_id);
CREATE INDEX IF NOT EXISTS idx_mentor_matches_mentor ON public.mentor_matches(mentor_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 2: ENRICHED METADATA SCHEMA (Agent Mesh)
-- ═══════════════════════════════════════════════════════════════════════════

-- Add metadata columns to applications
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS application_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS interview_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS assessment_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS review_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS review_decision TEXT,
ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- INTERVIEW SIGNALS TABLE
CREATE TABLE IF NOT EXISTS public.interview_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  interview_id TEXT NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'founder_signal', 'problem_signal', 'solution_signal',
    'risk_flag', 'strength', 'quote', 'data_point',
    'red_flag', 'green_flag', 'contradiction', 'vague_answer',
    'customer_evidence', 'metric', 'experience', 'insight'
  )),
  dimension TEXT NOT NULL CHECK (dimension IN ('founder', 'problem', 'user_value', 'execution')),
  content TEXT NOT NULL,
  source_quote TEXT,
  source_message_id TEXT,
  section TEXT NOT NULL,
  impact_score INTEGER NOT NULL CHECK (impact_score BETWEEN -5 AND 5),
  signal_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_application ON public.interview_signals(application_id);
CREATE INDEX IF NOT EXISTS idx_signals_type ON public.interview_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_signals_dimension ON public.interview_signals(dimension);
CREATE INDEX IF NOT EXISTS idx_signals_impact ON public.interview_signals(impact_score);

ALTER TABLE public.interview_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view all signals" ON public.interview_signals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

CREATE POLICY "System can insert signals" ON public.interview_signals
  FOR INSERT WITH CHECK (true);

-- AGENT RUNS TABLE
CREATE TABLE IF NOT EXISTS public.agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_type TEXT NOT NULL CHECK (agent_type IN (
    'interview', 'assessment', 'programme', 'matching', 'research', 'calibration', 'memo_generation'
  )),
  agent_version TEXT NOT NULL,
  application_id UUID REFERENCES public.applications(id),
  startup_id UUID REFERENCES public.startups(id),
  triggered_by UUID REFERENCES public.users(id),
  trigger_type TEXT CHECK (trigger_type IN ('automatic', 'manual', 'retry', 'scheduled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'timeout', 'cancelled')),
  error_message TEXT,
  input_summary JSONB,
  output_summary JSONB,
  run_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_application ON public.agent_runs(application_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_startup ON public.agent_runs(startup_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_type ON public.agent_runs(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON public.agent_runs(status);

ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view all runs" ON public.agent_runs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

CREATE POLICY "System can insert runs" ON public.agent_runs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update runs" ON public.agent_runs
  FOR UPDATE USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 3: RESEARCH AND MEMO COLUMNS
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS research_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS research_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS memo_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS memo_generated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_applications_research_completed
ON public.applications (research_completed_at)
WHERE research_completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_applications_memo_generated
ON public.applications (memo_generated_at)
WHERE memo_generated_at IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 4: FOUNDER REQUESTS AND PARTNER FEEDBACK
-- ═══════════════════════════════════════════════════════════════════════════

-- FOUNDER REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.founder_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  type TEXT NOT NULL CHECK (type IN ('mentor', 'feature', 'feedback', 'intro', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'declined', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES public.users(id),
  assigned_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_founder_requests_startup ON public.founder_requests(startup_id);
CREATE INDEX IF NOT EXISTS idx_founder_requests_status ON public.founder_requests(status);
CREATE INDEX IF NOT EXISTS idx_founder_requests_type ON public.founder_requests(type);

ALTER TABLE public.founder_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can view own requests" ON public.founder_requests
  FOR SELECT USING (
    startup_id IN (
      SELECT startup_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Founders can create requests" ON public.founder_requests
  FOR INSERT WITH CHECK (
    startup_id IN (
      SELECT startup_id FROM public.users WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Founders can update own pending requests" ON public.founder_requests
  FOR UPDATE USING (
    created_by = auth.uid() AND status = 'pending'
  );

CREATE POLICY "Partners can view all requests" ON public.founder_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

CREATE POLICY "Partners can update requests" ON public.founder_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- PARTNER FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.partner_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES public.users(id),
  from_name TEXT NOT NULL,
  message TEXT NOT NULL,
  feedback_type TEXT DEFAULT 'general' CHECK (feedback_type IN ('general', 'checkpoint', 'milestone', 'concern', 'praise')),
  checkpoint_id UUID REFERENCES public.checkpoints(id),
  is_visible_to_founder BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_feedback_startup ON public.partner_feedback(startup_id);

ALTER TABLE public.partner_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can view visible feedback" ON public.partner_feedback
  FOR SELECT USING (
    is_visible_to_founder = TRUE
    AND startup_id IN (
      SELECT startup_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Partners can view all feedback" ON public.partner_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

CREATE POLICY "Partners can create feedback" ON public.partner_feedback
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
    AND from_user_id = auth.uid()
  );

-- SHARED METRICS TABLE
CREATE TABLE IF NOT EXISTS public.shared_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('mrr', 'users', 'retention', 'nps', 'custom')),
  custom_metric_name TEXT,
  shared_by UUID NOT NULL REFERENCES public.users(id),
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  show_portfolio_benchmark BOOLEAN DEFAULT FALSE,
  show_cohort_benchmark BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_shared_metrics_startup ON public.shared_metrics(startup_id);

ALTER TABLE public.shared_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can view shared metrics config" ON public.shared_metrics
  FOR SELECT USING (
    startup_id IN (
      SELECT startup_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Partners can manage shared metrics" ON public.shared_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- Update trigger for founder_requests
CREATE OR REPLACE FUNCTION update_founder_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_founder_requests_updated_at ON public.founder_requests;
CREATE TRIGGER trigger_founder_requests_updated_at
  BEFORE UPDATE ON public.founder_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_founder_requests_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKET FOR DOCUMENTS
-- ═══════════════════════════════════════════════════════════════════════════

-- Note: Run this in Supabase Dashboard → Storage → Create Bucket
-- Bucket name: documents
-- Public: false
-- Or use SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════
