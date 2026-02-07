-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Founder Requests and Partner Feedback
-- Version: 004
-- Date: 2026-02-07
-- Description: Adds tables for founder requests and partner feedback
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- FOUNDER REQUESTS TABLE
-- Tracks requests from founders for mentors, features, and feedback
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.founder_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),

  -- Request details
  type TEXT NOT NULL CHECK (type IN ('mentor', 'feature', 'feedback', 'intro', 'other')),
  title TEXT NOT NULL,
  description TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'declined', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Assignment
  assigned_to UUID REFERENCES public.users(id),
  assigned_at TIMESTAMPTZ,

  -- Resolution
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_founder_requests_startup ON public.founder_requests(startup_id);
CREATE INDEX IF NOT EXISTS idx_founder_requests_status ON public.founder_requests(status);
CREATE INDEX IF NOT EXISTS idx_founder_requests_type ON public.founder_requests(type);
CREATE INDEX IF NOT EXISTS idx_founder_requests_assigned ON public.founder_requests(assigned_to) WHERE assigned_to IS NOT NULL;

-- Enable RLS
ALTER TABLE public.founder_requests ENABLE ROW LEVEL SECURITY;

-- Founders can view their own requests
CREATE POLICY "Founders can view own requests" ON public.founder_requests
  FOR SELECT USING (
    startup_id IN (
      SELECT startup_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Founders can create requests for their startup
CREATE POLICY "Founders can create requests" ON public.founder_requests
  FOR INSERT WITH CHECK (
    startup_id IN (
      SELECT startup_id FROM public.users WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Founders can update their own pending requests
CREATE POLICY "Founders can update own pending requests" ON public.founder_requests
  FOR UPDATE USING (
    created_by = auth.uid() AND status = 'pending'
  );

-- Partners can view all requests
CREATE POLICY "Partners can view all requests" ON public.founder_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- Partners can update requests
CREATE POLICY "Partners can update requests" ON public.founder_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTNER FEEDBACK TABLE
-- Tracks feedback from partners to founders
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.partner_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,

  -- Feedback source
  from_user_id UUID NOT NULL REFERENCES public.users(id),
  from_name TEXT NOT NULL,

  -- Content
  message TEXT NOT NULL,
  feedback_type TEXT DEFAULT 'general' CHECK (feedback_type IN ('general', 'checkpoint', 'milestone', 'concern', 'praise')),

  -- Related entities
  checkpoint_id UUID REFERENCES public.checkpoints(id),

  -- Visibility
  is_visible_to_founder BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_partner_feedback_startup ON public.partner_feedback(startup_id);
CREATE INDEX IF NOT EXISTS idx_partner_feedback_checkpoint ON public.partner_feedback(checkpoint_id) WHERE checkpoint_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.partner_feedback ENABLE ROW LEVEL SECURITY;

-- Founders can view visible feedback for their startup
CREATE POLICY "Founders can view visible feedback" ON public.partner_feedback
  FOR SELECT USING (
    is_visible_to_founder = TRUE
    AND startup_id IN (
      SELECT startup_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Partners can view all feedback
CREATE POLICY "Partners can view all feedback" ON public.partner_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- Partners can create feedback
CREATE POLICY "Partners can create feedback" ON public.partner_feedback
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
    AND from_user_id = auth.uid()
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- SHARED METRICS VIEW
-- For metrics that partners choose to share with founders
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.shared_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,

  -- What's shared
  metric_type TEXT NOT NULL CHECK (metric_type IN ('mrr', 'users', 'retention', 'nps', 'custom')),
  custom_metric_name TEXT,

  -- Sharing settings
  shared_by UUID NOT NULL REFERENCES public.users(id),
  shared_at TIMESTAMPTZ DEFAULT NOW(),

  -- Benchmark comparison
  show_portfolio_benchmark BOOLEAN DEFAULT FALSE,
  show_cohort_benchmark BOOLEAN DEFAULT FALSE,

  -- Active status
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shared_metrics_startup ON public.shared_metrics(startup_id);
CREATE INDEX IF NOT EXISTS idx_shared_metrics_active ON public.shared_metrics(startup_id, is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE public.shared_metrics ENABLE ROW LEVEL SECURITY;

-- Founders can view their shared metrics config
CREATE POLICY "Founders can view shared metrics config" ON public.shared_metrics
  FOR SELECT USING (
    startup_id IN (
      SELECT startup_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Partners can manage shared metrics
CREATE POLICY "Partners can manage shared metrics" ON public.shared_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- UPDATE TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Update updated_at on founder_requests
CREATE OR REPLACE FUNCTION update_founder_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_founder_requests_updated_at
  BEFORE UPDATE ON public.founder_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_founder_requests_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.founder_requests IS 'Tracks requests from founders for mentor intros, feature requests, and feedback';
COMMENT ON TABLE public.partner_feedback IS 'Feedback messages from partners to founders';
COMMENT ON TABLE public.shared_metrics IS 'Configuration for which metrics partners share with founders';
