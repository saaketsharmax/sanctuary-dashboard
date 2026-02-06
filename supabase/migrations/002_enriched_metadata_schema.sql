-- ═══════════════════════════════════════════════════════════════════════════
-- SANCTUARY OS — Enriched Metadata Schema Migration
-- Version: 002
-- Purpose: Add metadata collection for self-improving agent mesh
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. ENRICH APPLICATIONS TABLE
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

-- Add comment explaining the metadata structure
COMMENT ON COLUMN public.applications.application_metadata IS 'Form behavior tracking: source, time_per_step, fields_edited, content_analysis, red/green flags';
COMMENT ON COLUMN public.applications.interview_metadata IS 'Interview session data: duration, sections, behavioral_signals, content_quality';
COMMENT ON COLUMN public.applications.assessment_metadata IS 'AI assessment details: confidence, evidence_density, gaps, scoring_breakdown';
COMMENT ON COLUMN public.applications.review_metadata IS 'Partner review data: ai_agreement, score_adjustments, key_factors, conditions';

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. INTERVIEW SIGNALS TABLE
-- Store every signal extracted from interviews for analysis
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.interview_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  interview_id TEXT NOT NULL,

  -- Signal identification
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'founder_signal', 'problem_signal', 'solution_signal',
    'risk_flag', 'strength', 'quote', 'data_point',
    'red_flag', 'green_flag', 'contradiction', 'vague_answer',
    'customer_evidence', 'metric', 'experience', 'insight'
  )),
  dimension TEXT NOT NULL CHECK (dimension IN ('founder', 'problem', 'user_value', 'execution')),

  -- Signal content
  content TEXT NOT NULL,
  source_quote TEXT,
  source_message_id TEXT,
  section TEXT NOT NULL,

  -- Impact scoring
  impact_score INTEGER NOT NULL CHECK (impact_score BETWEEN -5 AND 5),

  -- Metadata for learning
  signal_metadata JSONB DEFAULT '{}'::jsonb,
  /*
  Expected structure:
  {
    "extraction_confidence": 0.92,
    "context": "string",
    "corroborating_evidence": ["string"],
    "contradicts": "signal_id or null",
    "follow_up_asked": boolean,
    "follow_up_response_quality": "detailed|vague|defensive",
    "semantic_tags": ["string"],
    "entities_mentioned": ["string"],
    "weight_at_extraction": number,
    "model_used": "string"
  }
  */

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for signal analysis
CREATE INDEX IF NOT EXISTS idx_signals_application ON public.interview_signals(application_id);
CREATE INDEX IF NOT EXISTS idx_signals_type ON public.interview_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_signals_dimension ON public.interview_signals(dimension);
CREATE INDEX IF NOT EXISTS idx_signals_impact ON public.interview_signals(impact_score);
CREATE INDEX IF NOT EXISTS idx_signals_section ON public.interview_signals(section);
CREATE INDEX IF NOT EXISTS idx_signals_created ON public.interview_signals(created_at);

-- RLS for interview signals
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

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. ASSESSMENT FEEDBACK TABLE
-- Capture partner feedback on AI assessments for calibration
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.assessment_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.users(id),

  -- Agreement tracking
  agrees_with_recommendation BOOLEAN,
  agrees_with_founder_score BOOLEAN,
  agrees_with_problem_score BOOLEAN,
  agrees_with_user_value_score BOOLEAN,
  agrees_with_execution_score BOOLEAN,

  -- Score adjustments (null if agrees)
  adjusted_founder_score INTEGER CHECK (adjusted_founder_score BETWEEN 0 AND 100),
  adjusted_problem_score INTEGER CHECK (adjusted_problem_score BETWEEN 0 AND 100),
  adjusted_user_value_score INTEGER CHECK (adjusted_user_value_score BETWEEN 0 AND 100),
  adjusted_execution_score INTEGER CHECK (adjusted_execution_score BETWEEN 0 AND 100),

  -- Qualitative feedback
  what_ai_missed TEXT,
  what_ai_overweighted TEXT,
  additional_notes TEXT,

  -- Structured feedback
  feedback_metadata JSONB DEFAULT '{}'::jsonb,
  /*
  Expected structure:
  {
    "feedback_source": "review_page|post_decision|quarterly_calibration",
    "specific_signal_feedback": [
      { "signal_id": "uuid", "feedback": "overweighted|underweighted|incorrect", "reason": "string" }
    ],
    "suggested_rubric_changes": [
      { "dimension": "string", "signal": "string", "current_weight": number, "suggested_weight": number, "reason": "string" }
    ],
    "time_spent_reviewing_minutes": number,
    "confidence_in_feedback": number
  }
  */

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_application ON public.assessment_feedback(application_id);
CREATE INDEX IF NOT EXISTS idx_feedback_partner ON public.assessment_feedback(partner_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON public.assessment_feedback(created_at);

-- RLS for assessment feedback
ALTER TABLE public.assessment_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view all feedback" ON public.assessment_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

CREATE POLICY "Partners can insert own feedback" ON public.assessment_feedback
  FOR INSERT WITH CHECK (auth.uid() = partner_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. STARTUP OUTCOMES TABLE
-- Track long-term outcomes to validate predictions
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.startup_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id),

  -- 3-month checkpoint
  three_month_mrr DECIMAL(12,2),
  three_month_users INTEGER,
  three_month_retention DECIMAL(5,2),
  three_month_nps INTEGER,
  three_month_checkpoints_completed INTEGER,
  three_month_recorded_at TIMESTAMPTZ,

  -- 6-month checkpoint
  six_month_mrr DECIMAL(12,2),
  six_month_users INTEGER,
  six_month_retention DECIMAL(5,2),
  six_month_raised_funding BOOLEAN DEFAULT FALSE,
  six_month_funding_amount DECIMAL(12,2),
  six_month_recorded_at TIMESTAMPTZ,

  -- 12-month checkpoint
  twelve_month_mrr DECIMAL(12,2),
  twelve_month_users INTEGER,
  twelve_month_team_size INTEGER,
  twelve_month_raised_funding BOOLEAN DEFAULT FALSE,
  twelve_month_funding_amount DECIMAL(12,2),
  twelve_month_recorded_at TIMESTAMPTZ,

  -- Final outcome
  outcome TEXT CHECK (outcome IN (
    'graduated_success',
    'graduated_moderate',
    'pivoted',
    'failed',
    'acquired',
    'active'
  )),
  outcome_date DATE,
  outcome_notes TEXT,

  -- Rich metadata for learning
  outcome_metadata JSONB DEFAULT '{}'::jsonb,
  /*
  Expected structure:
  {
    "initial_assessment": {
      "ai_score": number,
      "recommendation": "string",
      "key_risks_identified": ["string"],
      "key_strengths_identified": ["string"]
    },
    "risk_materialization": {
      "risk_name": { "materialized": boolean, "impact": "string", "mitigation": "string" }
    },
    "strength_validation": {
      "strength_name": { "validated": boolean, "evidence": "string" }
    },
    "surprises": [
      { "type": "positive|negative", "description": "string", "signal_we_missed": "string" }
    ],
    "mentor_impact": {
      "mentor_id": "uuid",
      "sessions_completed": number,
      "founder_rating": number,
      "key_contributions": ["string"]
    },
    "programme_effectiveness": {
      "checkpoints_completed_on_time": number,
      "most_valuable": "string",
      "least_valuable": "string"
    },
    "learnings_for_assessment": ["string"]
  }
  */

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outcomes_startup ON public.startup_outcomes(startup_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_application ON public.startup_outcomes(application_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_outcome ON public.startup_outcomes(outcome);
CREATE INDEX IF NOT EXISTS idx_outcomes_created ON public.startup_outcomes(created_at);

-- RLS for startup outcomes
ALTER TABLE public.startup_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view all outcomes" ON public.startup_outcomes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

CREATE POLICY "Partners can manage outcomes" ON public.startup_outcomes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. SIGNAL WEIGHTS TABLE
-- Track signal weights over time for calibration
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.signal_weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  signal_type TEXT NOT NULL,
  dimension TEXT NOT NULL CHECK (dimension IN ('founder', 'problem', 'user_value', 'execution')),

  -- Weights
  base_weight DECIMAL(5,2) NOT NULL,
  computed_weight DECIMAL(5,2),
  active_weight DECIMAL(5,2) NOT NULL,

  -- Statistical evidence
  sample_size INTEGER DEFAULT 0,
  correlation_with_partner_agreement DECIMAL(5,4),
  correlation_with_success DECIMAL(5,4),
  confidence_interval_lower DECIMAL(5,2),
  confidence_interval_upper DECIMAL(5,2),

  -- Versioning
  version INTEGER DEFAULT 1,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,

  -- Metadata
  weight_metadata JSONB DEFAULT '{}'::jsonb,
  /*
  Expected structure:
  {
    "source": "rubric|computed|manual_override",
    "last_computed_at": "timestamp",
    "computation_method": "correlation_analysis|regression|expert_input",
    "historical_weights": [{ "version": number, "weight": number, "effective_from": "date" }],
    "segment_variations": { "segment_name": { "weight": number, "sample_size": number } },
    "notes": "string"
  }
  */

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one active weight per signal/dimension
CREATE UNIQUE INDEX IF NOT EXISTS idx_signal_weights_active
  ON public.signal_weights(signal_type, dimension)
  WHERE effective_to IS NULL;

CREATE INDEX IF NOT EXISTS idx_signal_weights_dimension ON public.signal_weights(dimension);
CREATE INDEX IF NOT EXISTS idx_signal_weights_version ON public.signal_weights(version);

-- RLS for signal weights
ALTER TABLE public.signal_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view weights" ON public.signal_weights
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify weights" ON public.signal_weights
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner' AND partner_sub_type = 'startup_manager'
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. AGENT RUNS TABLE
-- Audit trail for every AI agent invocation
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What agent ran
  agent_type TEXT NOT NULL CHECK (agent_type IN (
    'interview', 'assessment', 'programme', 'matching', 'research', 'calibration'
  )),
  agent_version TEXT NOT NULL,

  -- Context
  application_id UUID REFERENCES public.applications(id),
  startup_id UUID REFERENCES public.startups(id),
  triggered_by UUID REFERENCES public.users(id),
  trigger_type TEXT CHECK (trigger_type IN ('automatic', 'manual', 'retry', 'scheduled')),

  -- Execution
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'timeout', 'cancelled')),
  error_message TEXT,

  -- Input/Output summaries (not full data, for quick reference)
  input_summary JSONB,
  output_summary JSONB,

  -- Rich execution metadata
  run_metadata JSONB DEFAULT '{}'::jsonb,
  /*
  Expected structure:
  {
    "model": "string",
    "prompt_version": "string",
    "rubric_version": "string",
    "token_usage": {
      "input_tokens": number,
      "output_tokens": number,
      "total_cost_usd": number
    },
    "performance": {
      "latency_ms": number,
      "retries": number,
      "rate_limited": boolean
    },
    "quality_metrics": {
      "json_parse_success": boolean,
      "schema_validation_success": boolean,
      "confidence_score": number
    },
    "feature_flags": { "flag_name": boolean },
    "errors": [{ "type": "string", "message": "string", "timestamp": "string" }]
  }
  */

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_application ON public.agent_runs(application_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_startup ON public.agent_runs(startup_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_type ON public.agent_runs(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON public.agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_started ON public.agent_runs(started_at);

-- RLS for agent runs
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
-- 7. SEED INITIAL SIGNAL WEIGHTS
-- Based on the scoring rubric
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.signal_weights (signal_type, dimension, base_weight, active_weight, weight_metadata)
VALUES
  -- Founder signals
  ('prior_exit', 'founder', 15, 15, '{"source": "rubric", "notes": "Prior successful exit"}'),
  ('domain_expertise_years', 'founder', 10, 10, '{"source": "rubric", "notes": "+2/year, max 10"}'),
  ('relevant_company_experience', 'founder', 5, 5, '{"source": "rubric", "notes": "Worked at relevant company"}'),
  ('adversity_overcome', 'founder', 5, 5, '{"source": "rubric", "notes": "Faced and overcame challenges"}'),
  ('cofounder_dynamic', 'founder', 5, 5, '{"source": "rubric", "notes": "Healthy co-founder relationship"}'),
  ('team_balance', 'founder', 5, 5, '{"source": "rubric", "notes": "Technical + business balance"}'),
  ('unclear_roles', 'founder', -5, -5, '{"source": "rubric", "notes": "Negative: unclear role division"}'),
  ('external_blame', 'founder', -10, -10, '{"source": "rubric", "notes": "Negative: blames external factors"}'),
  ('gives_up_easily', 'founder', -15, -15, '{"source": "rubric", "notes": "Negative: pattern of abandonment"}'),

  -- Problem signals
  ('customer_discovery_calls', 'problem', 20, 20, '{"source": "rubric", "notes": "+1/call, max 20"}'),
  ('specific_pain_quote', 'problem', 15, 15, '{"source": "rubric", "notes": "+5 each, max 15"}'),
  ('quantified_pain', 'problem', 10, 10, '{"source": "rubric", "notes": "Specific metrics on pain"}'),
  ('personal_experience', 'problem', 5, 5, '{"source": "rubric", "notes": "Founder experienced problem"}'),
  ('problem_frequency', 'problem', 5, 5, '{"source": "rubric", "notes": "Daily/weekly occurrence"}'),
  ('problem_severity', 'problem', 10, 10, '{"source": "rubric", "notes": "Hair on fire problem"}'),
  ('vague_problem', 'problem', -5, -5, '{"source": "rubric", "notes": "Negative: vague statement"}'),
  ('no_customer_evidence', 'problem', -15, -15, '{"source": "rubric", "notes": "Negative: no validation"}'),
  ('solution_seeking_problem', 'problem', -10, -10, '{"source": "rubric", "notes": "Negative: built tech first"}'),

  -- User Value signals
  ('paying_customers', 'user_value', 15, 15, '{"source": "rubric", "notes": "+3/customer, max 15"}'),
  ('mrr', 'user_value', 20, 20, '{"source": "rubric", "notes": "+1/100 MRR, max 20"}'),
  ('retention_rate', 'user_value', 15, 15, '{"source": "rubric", "notes": "+0.5/%, max 15"}'),
  ('organic_growth', 'user_value', 10, 10, '{"source": "rubric", "notes": "Referral-driven growth"}'),
  ('usage_frequency', 'user_value', 5, 5, '{"source": "rubric", "notes": "Daily active usage"}'),
  ('user_quote', 'user_value', 5, 5, '{"source": "rubric", "notes": "Compelling user feedback"}'),
  ('clear_value_metric', 'user_value', 5, 5, '{"source": "rubric", "notes": "Quantified value delivered"}'),
  ('no_paying_users', 'user_value', -10, -10, '{"source": "rubric", "notes": "Negative: free only"}'),
  ('high_churn', 'user_value', -10, -10, '{"source": "rubric", "notes": "Negative: >20% monthly"}'),
  ('users_dont_return', 'user_value', -15, -15, '{"source": "rubric", "notes": "Negative: poor retention"}'),

  -- Execution signals
  ('fast_time_to_user', 'execution', 10, 10, '{"source": "rubric", "notes": "<6 months to first user"}'),
  ('iteration_speed', 'execution', 5, 5, '{"source": "rubric", "notes": "Ships frequently"}'),
  ('smart_pivot', 'execution', 5, 5, '{"source": "rubric", "notes": "Data-driven pivots"}'),
  ('data_driven', 'execution', 5, 5, '{"source": "rubric", "notes": "Uses metrics for decisions"}'),
  ('lean_burn', 'execution', 5, 5, '{"source": "rubric", "notes": "Efficient spending"}'),
  ('clear_milestones', 'execution', 5, 5, '{"source": "rubric", "notes": "Clear roadmap"}'),
  ('slow_shipping', 'execution', -5, -5, '{"source": "rubric", "notes": "Negative: slow progress"}'),
  ('feature_creep', 'execution', -5, -5, '{"source": "rubric", "notes": "Negative: scope creep"}'),
  ('no_priorities', 'execution', -10, -10, '{"source": "rubric", "notes": "Negative: unclear focus"}'),
  ('premature_scaling', 'execution', -10, -10, '{"source": "rubric", "notes": "Negative: hired too early"}')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. HELPER FUNCTIONS FOR ANALYTICS
-- ═══════════════════════════════════════════════════════════════════════════

-- Function to calculate signal effectiveness
CREATE OR REPLACE FUNCTION calculate_signal_effectiveness()
RETURNS TABLE (
  signal_type TEXT,
  dimension TEXT,
  avg_impact DECIMAL,
  usage_count BIGINT,
  correlation_with_acceptance DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.signal_type,
    s.dimension,
    AVG(s.impact_score)::DECIMAL as avg_impact,
    COUNT(*)::BIGINT as usage_count,
    CORR(
      s.impact_score,
      CASE WHEN a.status IN ('accepted', 'approved') THEN 1 ELSE 0 END
    )::DECIMAL as correlation_with_acceptance
  FROM public.interview_signals s
  JOIN public.applications a ON s.application_id = a.id
  WHERE a.status IN ('accepted', 'approved', 'rejected')
  GROUP BY s.signal_type, s.dimension
  ORDER BY correlation_with_acceptance DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Function to get calibration drift
CREATE OR REPLACE FUNCTION get_calibration_drift(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  dimension TEXT,
  avg_ai_score DECIMAL,
  avg_partner_adjusted_score DECIMAL,
  drift DECIMAL,
  sample_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'founder' as dimension,
    AVG((a.ai_assessment->>'founderScore')::DECIMAL) as avg_ai_score,
    AVG(f.adjusted_founder_score)::DECIMAL as avg_partner_adjusted_score,
    AVG(f.adjusted_founder_score - (a.ai_assessment->>'founderScore')::DECIMAL)::DECIMAL as drift,
    COUNT(*)::BIGINT as sample_size
  FROM public.assessment_feedback f
  JOIN public.applications a ON f.application_id = a.id
  WHERE f.created_at > NOW() - (days_back || ' days')::INTERVAL
    AND f.adjusted_founder_score IS NOT NULL

  UNION ALL

  SELECT
    'problem' as dimension,
    AVG((a.ai_assessment->>'problemScore')::DECIMAL),
    AVG(f.adjusted_problem_score)::DECIMAL,
    AVG(f.adjusted_problem_score - (a.ai_assessment->>'problemScore')::DECIMAL)::DECIMAL,
    COUNT(*)::BIGINT
  FROM public.assessment_feedback f
  JOIN public.applications a ON f.application_id = a.id
  WHERE f.created_at > NOW() - (days_back || ' days')::INTERVAL
    AND f.adjusted_problem_score IS NOT NULL

  UNION ALL

  SELECT
    'user_value' as dimension,
    AVG((a.ai_assessment->>'userValueScore')::DECIMAL),
    AVG(f.adjusted_user_value_score)::DECIMAL,
    AVG(f.adjusted_user_value_score - (a.ai_assessment->>'userValueScore')::DECIMAL)::DECIMAL,
    COUNT(*)::BIGINT
  FROM public.assessment_feedback f
  JOIN public.applications a ON f.application_id = a.id
  WHERE f.created_at > NOW() - (days_back || ' days')::INTERVAL
    AND f.adjusted_user_value_score IS NOT NULL

  UNION ALL

  SELECT
    'execution' as dimension,
    AVG((a.ai_assessment->>'executionScore')::DECIMAL),
    AVG(f.adjusted_execution_score)::DECIMAL,
    AVG(f.adjusted_execution_score - (a.ai_assessment->>'executionScore')::DECIMAL)::DECIMAL,
    COUNT(*)::BIGINT
  FROM public.assessment_feedback f
  JOIN public.applications a ON f.application_id = a.id
  WHERE f.created_at > NOW() - (days_back || ' days')::INTERVAL
    AND f.adjusted_execution_score IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. TRIGGERS FOR UPDATED_AT
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TRIGGER update_startup_outcomes_updated_at
  BEFORE UPDATE ON public.startup_outcomes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_signal_weights_updated_at
  BEFORE UPDATE ON public.signal_weights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════
