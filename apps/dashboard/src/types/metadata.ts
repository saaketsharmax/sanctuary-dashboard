// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY OS — Metadata Types for Self-Improving Agent Mesh
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// APPLICATION METADATA
// ═══════════════════════════════════════════════════════════════════════════

export interface ApplicationMetadata {
  source: {
    referral_code: string | null
    referrer_id: string | null
    utm_source: string | null
    utm_campaign: string | null
    utm_medium: string | null
    landing_page: string
  }
  form_behavior: {
    started_at: string
    completed_at: string
    total_time_seconds: number
    time_per_step: {
      company: number
      founders: number
      problem: number
      solution: number
      traction: number
      fit: number
    }
    steps_revisited: string[]
    fields_edited_after_initial: string[]
    save_and_resume_count: number
    device_type: 'desktop' | 'mobile' | 'tablet'
    browser: string
  }
  content_analysis: {
    total_word_count: number
    avg_answer_length: Record<string, number>
    readability_score: number
    specificity_score: number
    buzzword_density: number
    metrics_mentioned: string[]
    named_entities: string[]
  }
  red_flags_detected: Array<{
    type: string
    description: string
    severity: 'low' | 'medium' | 'high'
  }>
  green_flags_detected: Array<{
    type: string
    description: string
    confidence: number
  }>
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERVIEW METADATA
// ═══════════════════════════════════════════════════════════════════════════

export interface InterviewSectionMetadata {
  messages: number
  duration_minutes: number
  avg_response_time_seconds: number
  avg_response_length: number
  probing_questions_asked: number
  topic_coverage: string[]
  topics_missed: string[]
}

export interface InterviewMetadata {
  session: {
    duration_minutes: number
    total_messages: number
    user_messages: number
    ai_messages: number
    pauses_taken: number
    total_pause_time_seconds: number
  }
  sections: {
    founder_dna: InterviewSectionMetadata
    problem_interrogation: InterviewSectionMetadata
    solution_execution: InterviewSectionMetadata
    market_competition: InterviewSectionMetadata
    sanctuary_fit: InterviewSectionMetadata
  }
  behavioral_signals: {
    response_time_pattern: 'consistent' | 'slowing' | 'speeding_up' | 'erratic'
    avg_response_time_seconds: number
    longest_response_time: {
      seconds: number
      question: string
    }
    shortest_response_time: {
      seconds: number
      question: string
    }
    questions_asked_to_clarify: number
    times_went_off_topic: number
    emotional_markers: string[]
  }
  content_quality: {
    specific_examples_given: number
    vague_answers_count: number
    contradictions_detected: number
    data_points_shared: number
    customer_quotes_shared: number
    metrics_mentioned: string[]
  }
  ai_model_used: string
  mode: 'live' | 'mock'
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT METADATA
// ═══════════════════════════════════════════════════════════════════════════

export interface DimensionEvidence {
  positive_signals: number
  negative_signals: number
  quotes_extracted: number
  data_points: number
}

export interface ScoringBreakdownSignal {
  signal: string
  impact: number
  confidence: number
  source_quote?: string
}

export interface DimensionScoringBreakdown {
  base_score: number
  signals_applied: ScoringBreakdownSignal[]
  adjustments: number
  final_score: number
}

export interface AssessmentMetadata {
  model_used: string
  generated_at: string
  generation_time_ms: number
  prompt_version: string
  scoring_rubric_version: string

  confidence: {
    overall: number
    founder: number
    problem: number
    user_value: number
    execution: number
  }

  evidence_density: {
    founder: DimensionEvidence
    problem: DimensionEvidence
    user_value: DimensionEvidence
    execution: DimensionEvidence
  }

  gaps_identified: Array<{
    dimension: 'founder' | 'problem' | 'user_value' | 'execution'
    missing_info: string
    impact_on_confidence: number
  }>

  scoring_breakdown: {
    founder: DimensionScoringBreakdown
    problem: DimensionScoringBreakdown
    user_value: DimensionScoringBreakdown
    execution: DimensionScoringBreakdown
  }

  similar_applications: Array<{
    application_id: string
    similarity_score: number
    outcome: string
  }>
}

// ═══════════════════════════════════════════════════════════════════════════
// REVIEW METADATA
// ═══════════════════════════════════════════════════════════════════════════

export interface ReviewMetadata {
  time_to_review_hours: number
  transcript_read_percentage: number
  sections_expanded: string[]
  time_spent_reviewing_minutes: number

  ai_agreement: {
    agrees_with_recommendation: boolean
    agrees_with_founder_score: boolean
    agrees_with_problem_score: boolean
    agrees_with_user_value_score: boolean
    agrees_with_execution_score: boolean
  }

  score_adjustments: Record<string, {
    ai_score: number
    adjusted_score: number
    reason: string
  }>

  key_factors_in_decision: string[]
  conditions_for_acceptance: string[]
  discussed_with: string[]
  discussion_notes: string
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERVIEW SIGNAL
// ═══════════════════════════════════════════════════════════════════════════

export type SignalType =
  | 'founder_signal'
  | 'problem_signal'
  | 'solution_signal'
  | 'risk_flag'
  | 'strength'
  | 'quote'
  | 'data_point'
  | 'red_flag'
  | 'green_flag'
  | 'contradiction'
  | 'vague_answer'
  | 'customer_evidence'
  | 'metric'
  | 'experience'
  | 'insight'

export type SignalDimension = 'founder' | 'problem' | 'user_value' | 'execution'

export interface InterviewSignal {
  id: string
  application_id: string
  interview_id: string
  signal_type: SignalType
  dimension: SignalDimension
  content: string
  source_quote: string | null
  source_message_id: string | null
  section: string
  impact_score: number // -5 to +5
  signal_metadata: SignalMetadata
  created_at: string
}

export interface SignalMetadata {
  extraction_confidence: number
  context: string
  corroborating_evidence: string[]
  contradicts: string | null
  follow_up_asked: boolean
  follow_up_response_quality: 'detailed' | 'vague' | 'defensive' | null
  semantic_tags: string[]
  entities_mentioned: string[]
  weight_at_extraction: number
  model_used: string
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT FEEDBACK
// ═══════════════════════════════════════════════════════════════════════════

export interface AssessmentFeedback {
  id: string
  application_id: string
  partner_id: string

  agrees_with_recommendation: boolean | null
  agrees_with_founder_score: boolean | null
  agrees_with_problem_score: boolean | null
  agrees_with_user_value_score: boolean | null
  agrees_with_execution_score: boolean | null

  adjusted_founder_score: number | null
  adjusted_problem_score: number | null
  adjusted_user_value_score: number | null
  adjusted_execution_score: number | null

  what_ai_missed: string | null
  what_ai_overweighted: string | null
  additional_notes: string | null

  feedback_metadata: FeedbackMetadata
  created_at: string
}

export interface FeedbackMetadata {
  feedback_source: 'review_page' | 'post_decision' | 'quarterly_calibration'
  specific_signal_feedback: Array<{
    signal_id: string
    feedback: 'overweighted' | 'underweighted' | 'incorrect'
    reason: string
  }>
  suggested_rubric_changes: Array<{
    dimension: string
    signal: string
    current_weight: number
    suggested_weight: number
    reason: string
  }>
  time_spent_reviewing_minutes: number
  confidence_in_feedback: number
}

// ═══════════════════════════════════════════════════════════════════════════
// STARTUP OUTCOMES
// ═══════════════════════════════════════════════════════════════════════════

export type OutcomeType =
  | 'graduated_success'
  | 'graduated_moderate'
  | 'pivoted'
  | 'failed'
  | 'acquired'
  | 'active'

export interface StartupOutcome {
  id: string
  startup_id: string
  application_id: string | null

  // Checkpoints
  three_month_mrr: number | null
  three_month_users: number | null
  three_month_retention: number | null
  three_month_nps: number | null
  three_month_checkpoints_completed: number | null
  three_month_recorded_at: string | null

  six_month_mrr: number | null
  six_month_users: number | null
  six_month_retention: number | null
  six_month_raised_funding: boolean
  six_month_funding_amount: number | null
  six_month_recorded_at: string | null

  twelve_month_mrr: number | null
  twelve_month_users: number | null
  twelve_month_team_size: number | null
  twelve_month_raised_funding: boolean
  twelve_month_funding_amount: number | null
  twelve_month_recorded_at: string | null

  outcome: OutcomeType | null
  outcome_date: string | null
  outcome_notes: string | null

  outcome_metadata: OutcomeMetadata
  created_at: string
  updated_at: string
}

export interface OutcomeMetadata {
  initial_assessment: {
    ai_score: number
    recommendation: string
    key_risks_identified: string[]
    key_strengths_identified: string[]
  }

  risk_materialization: Record<string, {
    materialized: boolean
    impact: string
    mitigation: string
  }>

  strength_validation: Record<string, {
    validated: boolean
    evidence: string
  }>

  surprises: Array<{
    type: 'positive' | 'negative'
    description: string
    signal_we_missed: string
  }>

  mentor_impact: {
    mentor_id: string
    sessions_completed: number
    founder_rating: number
    key_contributions: string[]
  } | null

  programme_effectiveness: {
    checkpoints_completed_on_time: number
    checkpoints_completed_late: number
    checkpoints_skipped: number
    most_valuable_checkpoint: string
    least_valuable_checkpoint: string
  }

  learnings_for_assessment: string[]
}

// ═══════════════════════════════════════════════════════════════════════════
// SIGNAL WEIGHTS
// ═══════════════════════════════════════════════════════════════════════════

export interface SignalWeight {
  id: string
  signal_type: string
  dimension: SignalDimension

  base_weight: number
  computed_weight: number | null
  active_weight: number

  sample_size: number
  correlation_with_partner_agreement: number | null
  correlation_with_success: number | null
  confidence_interval_lower: number | null
  confidence_interval_upper: number | null

  version: number
  effective_from: string
  effective_to: string | null

  weight_metadata: WeightMetadata
  created_at: string
  updated_at: string
}

export interface WeightMetadata {
  source: 'rubric' | 'computed' | 'manual_override'
  last_computed_at: string | null
  computation_method: 'correlation_analysis' | 'regression' | 'expert_input' | null
  historical_weights: Array<{
    version: number
    weight: number
    effective_from: string
  }>
  segment_variations: Record<string, {
    weight: number
    sample_size: number
  }>
  notes: string
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENT RUNS
// ═══════════════════════════════════════════════════════════════════════════

export type AgentType = 'interview' | 'assessment' | 'programme' | 'matching' | 'research' | 'calibration'
export type AgentRunStatus = 'running' | 'completed' | 'failed' | 'timeout' | 'cancelled'
export type TriggerType = 'automatic' | 'manual' | 'retry' | 'scheduled'

export interface AgentRun {
  id: string
  agent_type: AgentType
  agent_version: string

  application_id: string | null
  startup_id: string | null
  triggered_by: string | null
  trigger_type: TriggerType

  started_at: string
  completed_at: string | null
  status: AgentRunStatus
  error_message: string | null

  input_summary: Record<string, unknown>
  output_summary: Record<string, unknown>

  run_metadata: AgentRunMetadata
  created_at: string
}

export interface AgentRunMetadata {
  model: string
  prompt_version: string
  rubric_version: string

  token_usage: {
    input_tokens: number
    output_tokens: number
    total_cost_usd: number
  }

  performance: {
    latency_ms: number
    retries: number
    rate_limited: boolean
  }

  quality_metrics: {
    json_parse_success: boolean
    schema_validation_success: boolean
    confidence_score: number
  }

  feature_flags: Record<string, boolean>

  errors: Array<{
    type: string
    message: string
    timestamp: string
  }>
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function createEmptyApplicationMetadata(): ApplicationMetadata {
  return {
    source: {
      referral_code: null,
      referrer_id: null,
      utm_source: null,
      utm_campaign: null,
      utm_medium: null,
      landing_page: '',
    },
    form_behavior: {
      started_at: new Date().toISOString(),
      completed_at: '',
      total_time_seconds: 0,
      time_per_step: {
        company: 0,
        founders: 0,
        problem: 0,
        solution: 0,
        traction: 0,
        fit: 0,
      },
      steps_revisited: [],
      fields_edited_after_initial: [],
      save_and_resume_count: 0,
      device_type: 'desktop',
      browser: '',
    },
    content_analysis: {
      total_word_count: 0,
      avg_answer_length: {},
      readability_score: 0,
      specificity_score: 0,
      buzzword_density: 0,
      metrics_mentioned: [],
      named_entities: [],
    },
    red_flags_detected: [],
    green_flags_detected: [],
  }
}

export function createEmptyInterviewMetadata(): InterviewMetadata {
  const emptySectionMetadata: InterviewSectionMetadata = {
    messages: 0,
    duration_minutes: 0,
    avg_response_time_seconds: 0,
    avg_response_length: 0,
    probing_questions_asked: 0,
    topic_coverage: [],
    topics_missed: [],
  }

  return {
    session: {
      duration_minutes: 0,
      total_messages: 0,
      user_messages: 0,
      ai_messages: 0,
      pauses_taken: 0,
      total_pause_time_seconds: 0,
    },
    sections: {
      founder_dna: { ...emptySectionMetadata },
      problem_interrogation: { ...emptySectionMetadata },
      solution_execution: { ...emptySectionMetadata },
      market_competition: { ...emptySectionMetadata },
      sanctuary_fit: { ...emptySectionMetadata },
    },
    behavioral_signals: {
      response_time_pattern: 'consistent',
      avg_response_time_seconds: 0,
      longest_response_time: { seconds: 0, question: '' },
      shortest_response_time: { seconds: 0, question: '' },
      questions_asked_to_clarify: 0,
      times_went_off_topic: 0,
      emotional_markers: [],
    },
    content_quality: {
      specific_examples_given: 0,
      vague_answers_count: 0,
      contradictions_detected: 0,
      data_points_shared: 0,
      customer_quotes_shared: 0,
      metrics_mentioned: [],
    },
    ai_model_used: '',
    mode: 'mock',
  }
}

export function createEmptyAssessmentMetadata(): AssessmentMetadata {
  const emptyEvidence: DimensionEvidence = {
    positive_signals: 0,
    negative_signals: 0,
    quotes_extracted: 0,
    data_points: 0,
  }

  const emptyBreakdown: DimensionScoringBreakdown = {
    base_score: 50,
    signals_applied: [],
    adjustments: 0,
    final_score: 50,
  }

  return {
    model_used: '',
    generated_at: '',
    generation_time_ms: 0,
    prompt_version: '',
    scoring_rubric_version: '',
    confidence: {
      overall: 0,
      founder: 0,
      problem: 0,
      user_value: 0,
      execution: 0,
    },
    evidence_density: {
      founder: { ...emptyEvidence },
      problem: { ...emptyEvidence },
      user_value: { ...emptyEvidence },
      execution: { ...emptyEvidence },
    },
    gaps_identified: [],
    scoring_breakdown: {
      founder: { ...emptyBreakdown },
      problem: { ...emptyBreakdown },
      user_value: { ...emptyBreakdown },
      execution: { ...emptyBreakdown },
    },
    similar_applications: [],
  }
}
