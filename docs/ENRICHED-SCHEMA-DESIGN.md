# Enriched Schema Design — Agent Metadata Collection

## Philosophy

Every interaction generates metadata that can improve future inference:
- **Behavioral signals** - How did they answer, not just what
- **Confidence markers** - How certain is the AI about its extraction
- **Context preservation** - Why was this decision made
- **Temporal patterns** - When and how long things took

---

## 1. Applications Table — Enriched

```sql
-- Drop and recreate with metadata
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  startup_id UUID REFERENCES public.startups(id),

  -- ═══════════════════════════════════════════════════════════════════
  -- CORE APPLICATION DATA
  -- ═══════════════════════════════════════════════════════════════════
  status TEXT DEFAULT 'draft',
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

  -- ═══════════════════════════════════════════════════════════════════
  -- APPLICATION METADATA (Agent-collected)
  -- ═══════════════════════════════════════════════════════════════════
  application_metadata JSONB DEFAULT '{}'::jsonb,
  /*
  {
    "source": {
      "referral_code": "string | null",
      "referrer_id": "uuid | null",
      "utm_source": "string | null",
      "utm_campaign": "string | null",
      "landing_page": "string"
    },
    "form_behavior": {
      "started_at": "timestamp",
      "completed_at": "timestamp",
      "total_time_seconds": 1840,
      "time_per_step": {
        "company": 120,
        "founders": 340,
        "problem": 280,
        "solution": 220,
        "traction": 180,
        "fit": 200
      },
      "steps_revisited": ["problem", "founders"],
      "fields_edited_after_initial": ["problem_description", "mrr"],
      "save_and_resume_count": 2,
      "device_type": "desktop | mobile | tablet",
      "browser": "Chrome 120"
    },
    "content_analysis": {
      "total_word_count": 1240,
      "avg_answer_length": {
        "problem": 156,
        "solution": 134,
        "why_sanctuary": 89
      },
      "readability_score": 72,
      "specificity_score": 0.78,  // AI-detected: specific vs vague
      "buzzword_density": 0.12,   // "AI-powered", "disrupt", etc.
      "metrics_mentioned": ["$2400 MRR", "12 users", "47 calls"],
      "named_entities": ["GitLab", "Stripe", "YC"]
    },
    "red_flags_detected": [
      {
        "type": "inconsistency",
        "description": "MRR doesn't match user count × stated price",
        "severity": "low"
      }
    ],
    "green_flags_detected": [
      {
        "type": "domain_expertise",
        "description": "Founder worked at 2 relevant companies",
        "confidence": 0.9
      }
    ]
  }
  */

  -- ═══════════════════════════════════════════════════════════════════
  -- INTERVIEW DATA
  -- ═══════════════════════════════════════════════════════════════════
  interview_started_at TIMESTAMPTZ,
  interview_completed_at TIMESTAMPTZ,
  interview_transcript JSONB,

  -- Interview metadata (NEW)
  interview_metadata JSONB DEFAULT '{}'::jsonb,
  /*
  {
    "session": {
      "duration_minutes": 52,
      "total_messages": 47,
      "user_messages": 23,
      "ai_messages": 24,
      "pauses_taken": 2,
      "total_pause_time_seconds": 340
    },
    "sections": {
      "founder_dna": {
        "messages": 10,
        "duration_minutes": 12,
        "avg_response_time_seconds": 45,
        "avg_response_length": 89,
        "probing_questions_asked": 3,
        "topic_coverage": ["background", "motivation", "cofounder_dynamic"],
        "topics_missed": ["failure_experience"]
      },
      "problem_interrogation": { ... },
      "solution_execution": { ... },
      "market_competition": { ... },
      "sanctuary_fit": { ... }
    },
    "behavioral_signals": {
      "response_time_pattern": "consistent | slowing | speeding_up",
      "avg_response_time_seconds": 38,
      "longest_response_time": { "seconds": 180, "question": "..." },
      "shortest_response_time": { "seconds": 8, "question": "..." },
      "questions_asked_to_clarify": 2,
      "times_went_off_topic": 1,
      "emotional_markers": ["enthusiasm:high", "defensiveness:low"]
    },
    "content_quality": {
      "specific_examples_given": 12,
      "vague_answers_count": 3,
      "contradictions_detected": 0,
      "data_points_shared": 8,
      "customer_quotes_shared": 4,
      "metrics_mentioned": ["$2400 MRR", "90% retention", "47 calls"]
    },
    "ai_model_used": "claude-sonnet-4-20250514",
    "mode": "live | mock"
  }
  */

  -- ═══════════════════════════════════════════════════════════════════
  -- ASSESSMENT DATA
  -- ═══════════════════════════════════════════════════════════════════
  ai_assessment JSONB,
  ai_score DECIMAL(3,2),

  -- Assessment metadata (NEW)
  assessment_metadata JSONB DEFAULT '{}'::jsonb,
  /*
  {
    "model_used": "claude-sonnet-4-20250514",
    "generated_at": "timestamp",
    "generation_time_ms": 4500,
    "prompt_version": "v2.3",
    "scoring_rubric_version": "v1.0",

    "confidence": {
      "overall": 0.82,
      "founder": 0.88,
      "problem": 0.75,
      "user_value": 0.79,
      "execution": 0.85
    },

    "evidence_density": {
      "founder": {
        "positive_signals": 5,
        "negative_signals": 1,
        "quotes_extracted": 3,
        "data_points": 2
      },
      "problem": { ... },
      "user_value": { ... },
      "execution": { ... }
    },

    "gaps_identified": [
      {
        "dimension": "user_value",
        "missing_info": "retention_rate",
        "impact_on_confidence": -0.15
      }
    ],

    "scoring_breakdown": {
      "founder": {
        "base_score": 50,
        "signals_applied": [
          { "signal": "prior_exit", "impact": +15 },
          { "signal": "domain_expertise_years", "impact": +8 },
          { "signal": "cofounder_conflict_resolution", "impact": +5 }
        ],
        "final_score": 78
      }
    },

    "similar_applications": [
      {
        "application_id": "uuid",
        "similarity_score": 0.85,
        "outcome": "accepted_and_graduated"
      }
    ]
  }
  */

  -- ═══════════════════════════════════════════════════════════════════
  -- REVIEW & DECISION DATA
  -- ═══════════════════════════════════════════════════════════════════
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  review_decision TEXT,
  review_notes TEXT,

  -- Review metadata (NEW)
  review_metadata JSONB DEFAULT '{}'::jsonb,
  /*
  {
    "time_to_review_hours": 24,
    "transcript_read_percentage": 100,
    "sections_expanded": ["founder_dna", "problem_interrogation"],
    "time_spent_reviewing_minutes": 12,

    "ai_agreement": {
      "agrees_with_recommendation": true,
      "agrees_with_founder_score": true,
      "agrees_with_problem_score": false,
      "agrees_with_user_value_score": true,
      "agrees_with_execution_score": true
    },

    "score_adjustments": {
      "problem": { "ai_score": 72, "adjusted_score": 80, "reason": "AI underweighted customer discovery depth" }
    },

    "key_factors_in_decision": [
      "Strong founder-problem fit",
      "Clear evidence of customer pain",
      "Concerns about GTM experience"
    ],

    "conditions_for_acceptance": [
      "Must complete pricing validation by week 4",
      "Assign sales-focused mentor"
    ],

    "discussed_with": ["partner-uuid-1", "partner-uuid-2"],
    "discussion_notes": "Debated GTM risk, decided mentor can address"
  }
  */

  -- Timestamps
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Interview Signals Table — New

```sql
-- Separate table for extracted signals (enables analysis)
CREATE TABLE public.interview_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.applications(id),
  interview_id TEXT NOT NULL,  -- From interview store

  -- Signal identification
  signal_type TEXT NOT NULL,
  /*
    'founder_signal', 'problem_signal', 'solution_signal',
    'risk_flag', 'strength', 'quote', 'data_point',
    'red_flag', 'green_flag', 'contradiction', 'vague_answer'
  */

  dimension TEXT NOT NULL,  -- 'founder', 'problem', 'user_value', 'execution'

  -- Signal content
  content TEXT NOT NULL,
  source_quote TEXT,  -- The actual words from founder
  source_message_id TEXT,  -- Reference to transcript message
  section TEXT NOT NULL,  -- Which interview section

  -- Impact scoring
  impact_score INTEGER NOT NULL,  -- -5 to +5

  -- ═══════════════════════════════════════════════════════════════════
  -- SIGNAL METADATA
  -- ═══════════════════════════════════════════════════════════════════
  signal_metadata JSONB DEFAULT '{}'::jsonb,
  /*
  {
    "extraction_confidence": 0.92,
    "context": "Founder mentioned this when discussing co-founder relationship",
    "corroborating_evidence": [
      "Also mentioned in application form",
      "LinkedIn confirms GitLab acquisition"
    ],
    "contradicts": null,  // or signal_id if contradicts another signal
    "follow_up_asked": true,
    "follow_up_response_quality": "detailed | vague | defensive",

    "semantic_tags": ["exit", "acquisition", "enterprise"],
    "entities_mentioned": ["GitLab", "Series B"],

    "similar_signals_in_corpus": [
      { "application_id": "uuid", "similarity": 0.89 }
    ],

    "weight_at_extraction": 15,  // Current rubric weight
    "historical_correlation_with_success": 0.72  // Updated weekly
  }
  */

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_signals_application ON interview_signals(application_id);
CREATE INDEX idx_signals_type ON interview_signals(signal_type);
CREATE INDEX idx_signals_dimension ON interview_signals(dimension);
CREATE INDEX idx_signals_impact ON interview_signals(impact_score);
```

---

## 3. Assessment Feedback Table — New

```sql
CREATE TABLE public.assessment_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.applications(id),
  partner_id UUID REFERENCES public.users(id),

  -- Agreement tracking
  agrees_with_recommendation BOOLEAN,
  agrees_with_founder_score BOOLEAN,
  agrees_with_problem_score BOOLEAN,
  agrees_with_user_value_score BOOLEAN,
  agrees_with_execution_score BOOLEAN,

  -- Score adjustments
  adjusted_founder_score INTEGER,
  adjusted_problem_score INTEGER,
  adjusted_user_value_score INTEGER,
  adjusted_execution_score INTEGER,

  -- Qualitative feedback
  what_ai_missed TEXT,
  what_ai_overweighted TEXT,
  signals_ai_should_have_caught JSONB,  -- Array of signal descriptions

  -- ═══════════════════════════════════════════════════════════════════
  -- FEEDBACK METADATA
  -- ═══════════════════════════════════════════════════════════════════
  feedback_metadata JSONB DEFAULT '{}'::jsonb,
  /*
  {
    "feedback_source": "review_page | post_decision | quarterly_calibration",
    "time_since_review_hours": 0,
    "partner_experience_level": "senior | junior",
    "partner_domain_expertise": ["saas", "devtools"],

    "specific_signal_feedback": [
      {
        "signal_id": "uuid",
        "feedback": "overweighted",
        "reason": "Prior exit was acqui-hire, not real success"
      }
    ],

    "suggested_rubric_changes": [
      {
        "dimension": "founder",
        "signal": "prior_exit",
        "current_weight": 15,
        "suggested_weight": 10,
        "reason": "Not all exits are equal"
      }
    ]
  }
  */

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Startup Outcomes Table — New

```sql
CREATE TABLE public.startup_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id UUID REFERENCES public.startups(id),
  application_id UUID REFERENCES public.applications(id),

  -- ═══════════════════════════════════════════════════════════════════
  -- CHECKPOINTS (Structured milestones)
  -- ═══════════════════════════════════════════════════════════════════

  -- 3-month checkpoint
  three_month_mrr DECIMAL(12,2),
  three_month_users INTEGER,
  three_month_retention DECIMAL(5,2),
  three_month_nps INTEGER,
  three_month_checkpoints_completed INTEGER,

  -- 6-month checkpoint
  six_month_mrr DECIMAL(12,2),
  six_month_users INTEGER,
  six_month_retention DECIMAL(5,2),
  six_month_raised_funding BOOLEAN DEFAULT FALSE,
  six_month_funding_amount DECIMAL(12,2),

  -- 12-month checkpoint
  twelve_month_mrr DECIMAL(12,2),
  twelve_month_users INTEGER,
  twelve_month_team_size INTEGER,
  twelve_month_raised_funding BOOLEAN DEFAULT FALSE,
  twelve_month_funding_amount DECIMAL(12,2),

  -- Final outcome
  outcome TEXT CHECK (outcome IN (
    'graduated_success',  -- Hit milestones, raised funding or profitable
    'graduated_moderate', -- Completed program, moderate traction
    'pivoted',            -- Changed direction significantly
    'failed',             -- Shut down
    'acquired',           -- Acquired by another company
    'active'              -- Still in program
  )),
  outcome_date DATE,

  -- ═══════════════════════════════════════════════════════════════════
  -- OUTCOME METADATA
  -- ═══════════════════════════════════════════════════════════════════
  outcome_metadata JSONB DEFAULT '{}'::jsonb,
  /*
  {
    "initial_assessment": {
      "ai_score": 78,
      "recommendation": "accept",
      "key_risks_identified": ["gtm_inexperience"],
      "key_strengths_identified": ["founder_problem_fit", "technical_moat"]
    },

    "risk_materialization": {
      "gtm_inexperience": {
        "materialized": true,
        "impact": "Took 3 months longer to find channel",
        "mitigation_that_worked": "Sales mentor weekly sessions"
      }
    },

    "strength_validation": {
      "founder_problem_fit": {
        "validated": true,
        "evidence": "Founder's network drove first 10 customers"
      }
    },

    "surprises": [
      {
        "type": "positive",
        "description": "Founder learned sales faster than expected",
        "signal_we_missed": "Founder mentioned sales role in college"
      }
    ],

    "mentor_impact": {
      "mentor_id": "uuid",
      "sessions_completed": 12,
      "founder_rating": 4.8,
      "key_contributions": ["Pricing strategy", "Enterprise sales process"]
    },

    "programme_effectiveness": {
      "checkpoints_completed_on_time": 8,
      "checkpoints_completed_late": 2,
      "checkpoints_skipped": 0,
      "most_valuable_checkpoint": "Week 4 - Pricing validation",
      "least_valuable_checkpoint": "Week 8 - Investor deck review"
    },

    "learnings_for_assessment": [
      "GTM risk was correctly identified but impact underestimated",
      "Technical moat signal correctly predicted enterprise interest"
    ]
  }
  */

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Signal Weights Table — For Self-Improvement

```sql
CREATE TABLE public.signal_weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  signal_type TEXT NOT NULL,
  dimension TEXT NOT NULL,

  -- Weights
  base_weight DECIMAL(5,2) NOT NULL,      -- From rubric
  computed_weight DECIMAL(5,2),            -- From data analysis
  active_weight DECIMAL(5,2) NOT NULL,     -- Currently in use

  -- Evidence
  sample_size INTEGER DEFAULT 0,
  correlation_with_partner_agreement DECIMAL(5,4),
  correlation_with_success DECIMAL(5,4),

  -- Versioning
  version INTEGER DEFAULT 1,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,

  -- ═══════════════════════════════════════════════════════════════════
  -- WEIGHT METADATA
  -- ═══════════════════════════════════════════════════════════════════
  weight_metadata JSONB DEFAULT '{}'::jsonb,
  /*
  {
    "source": "rubric | computed | manual_override",
    "last_computed_at": "timestamp",
    "computation_method": "correlation_analysis | regression | expert_input",

    "historical_weights": [
      { "version": 1, "weight": 15, "effective_from": "2024-01-01" },
      { "version": 2, "weight": 12, "effective_from": "2024-06-01" }
    ],

    "confidence_interval": {
      "lower": 10,
      "upper": 18,
      "confidence": 0.95
    },

    "segment_variations": {
      "b2b_saas": { "weight": 18, "sample_size": 45 },
      "consumer": { "weight": 10, "sample_size": 23 }
    },

    "notes": "Reduced weight after finding acqui-hires don't predict success"
  }
  */

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_signal_weights_active
  ON signal_weights(signal_type, dimension)
  WHERE effective_to IS NULL;
```

---

## 6. Agent Runs Table — Track Every AI Invocation

```sql
CREATE TABLE public.agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What agent ran
  agent_type TEXT NOT NULL,  -- 'interview', 'assessment', 'programme', 'matching'
  agent_version TEXT NOT NULL,

  -- Context
  application_id UUID REFERENCES public.applications(id),
  startup_id UUID REFERENCES public.startups(id),
  triggered_by UUID REFERENCES public.users(id),
  trigger_type TEXT,  -- 'automatic', 'manual', 'retry'

  -- Execution
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running',  -- 'running', 'completed', 'failed', 'timeout'

  -- Input/Output
  input_summary JSONB,  -- Key inputs (not full data)
  output_summary JSONB, -- Key outputs

  -- ═══════════════════════════════════════════════════════════════════
  -- RUN METADATA
  -- ═══════════════════════════════════════════════════════════════════
  run_metadata JSONB DEFAULT '{}'::jsonb,
  /*
  {
    "model": "claude-sonnet-4-20250514",
    "prompt_version": "v2.3",
    "rubric_version": "v1.0",

    "token_usage": {
      "input_tokens": 4500,
      "output_tokens": 1200,
      "total_cost_usd": 0.045
    },

    "performance": {
      "latency_ms": 3200,
      "retries": 0,
      "rate_limited": false
    },

    "quality_metrics": {
      "json_parse_success": true,
      "schema_validation_success": true,
      "confidence_score": 0.85
    },

    "errors": [],

    "feature_flags": {
      "use_new_scoring_rubric": true,
      "enable_signal_correlation": false
    }
  }
  */

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_runs_application ON agent_runs(application_id);
CREATE INDEX idx_agent_runs_type ON agent_runs(agent_type);
CREATE INDEX idx_agent_runs_status ON agent_runs(status);
```

---

## Summary: What Metadata Enables

| Metadata Type | Enables |
|---------------|---------|
| **Form behavior** | Detect rushed vs thoughtful applications |
| **Response timing** | Identify hesitation on tough questions |
| **Content analysis** | Spot vague vs specific answers |
| **Signal confidence** | Know when to trust extractions |
| **Evidence density** | Flag thin assessments for human review |
| **Partner feedback** | Calibrate scoring over time |
| **Outcome tracking** | Validate which signals actually matter |
| **Weight history** | Understand how model evolved |
| **Agent runs** | Debug, audit, optimize |

---

## Next Steps

1. [ ] Review and approve schema changes
2. [ ] Create migration script for existing data
3. [ ] Update API routes to collect metadata
4. [ ] Update agents to populate metadata fields
5. [ ] Build analytics dashboard for metadata insights
