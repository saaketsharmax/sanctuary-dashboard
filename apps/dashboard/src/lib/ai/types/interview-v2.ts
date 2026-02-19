// =====================================================
// SANCTUARY INTERVIEW AGENT V2 — Types
// =====================================================
//
// 7 primitive categories, 8 interview dimensions,
// 10 questioning techniques, Startup DNA Report output.
// =====================================================

// -----------------------------------------------------
// INTERVIEW DIMENSIONS (V2: 8 dimensions, up from 5)
// -----------------------------------------------------

export const INTERVIEW_DIMENSIONS_V2 = [
  { value: 'founder_core', label: 'Founder Core', duration: '8-10 min', order: 1 },
  { value: 'team_chemistry', label: 'Team Chemistry', duration: '8-10 min', order: 2 },
  { value: 'problem_anatomy', label: 'Problem Anatomy', duration: '10-12 min', order: 3 },
  { value: 'user_reality', label: 'User Reality', duration: '8-10 min', order: 4 },
  { value: 'solution_thesis', label: 'Solution Thesis', duration: '8-10 min', order: 5 },
  { value: 'market_mechanics', label: 'Market Mechanics', duration: '6-8 min', order: 6 },
  { value: 'traction_truth', label: 'Traction Truth', duration: '6-8 min', order: 7 },
  { value: 'growth_path', label: 'Growth Path', duration: '5-7 min', order: 8 },
] as const

export type InterviewDimensionV2 = (typeof INTERVIEW_DIMENSIONS_V2)[number]['value']

// Minimum user messages before allowing transition out of a dimension
export const MIN_MESSAGES_PER_DIMENSION: Record<InterviewDimensionV2, number> = {
  founder_core: 4,
  team_chemistry: 3,
  problem_anatomy: 5,
  user_reality: 3,
  solution_thesis: 4,
  market_mechanics: 3,
  traction_truth: 3,
  growth_path: 2,
}

// Dimension ordering for transitions
export const DIMENSION_ORDER: InterviewDimensionV2[] = [
  'founder_core',
  'team_chemistry',
  'problem_anatomy',
  'user_reality',
  'solution_thesis',
  'market_mechanics',
  'traction_truth',
  'growth_path',
]

// -----------------------------------------------------
// QUESTIONING TECHNIQUES
// -----------------------------------------------------

export const QUESTIONING_TECHNIQUES = [
  'inversion',          // "If you fail, why?"
  'time_machine',       // "It's 2029, you've won/lost"
  'user_story',         // "Pick a user. Walk me through their Tuesday."
  'chemistry_probe',    // "Biggest disagreement with co-founder"
  'second_order',       // "If you succeed, who loses?"
  'evidence_tribunal',  // "You said X. Prove it."
  'uncomfortable_truth',// "What are you afraid I'll ask?"
  'insight_extraction', // "What do you know that nobody else does?"
  'stress_test',        // "Google launches tomorrow. Now what?"
  'love_test',          // "Who LOVES your product?"
] as const

export type QuestioningTechnique = (typeof QUESTIONING_TECHNIQUES)[number]

// -----------------------------------------------------
// STARTUP PRIMITIVES — The atomic units of truth
// -----------------------------------------------------

export interface ProblemPrimitives {
  painIntensity: number | null        // 1-10
  painFrequency: string | null        // daily / weekly / monthly / yearly
  painOwner: string | null            // who feels it vs. who pays
  currentSpend: string | null         // time + money on workaround
  urgencyTrigger: string | null       // what forces action NOW
  hairOnFireMoment: string | null     // specific scenario
}

export interface SolutionPrimitives {
  tenXFactor: string | null           // what's 10x better, specifically
  ahaMoment: string | null            // when does user "get it"
  timeToValue: string | null          // minutes / hours / days to see benefit
  switchingCost: string | null        // what user gives up
  lockInMechanism: string | null      // why they stay
  failureMode: string | null          // how it breaks
}

export interface MarketPrimitives {
  wedge: string | null                // specific entry point
  expandPath: string | null           // how you grow from wedge
  marketTiming: string | null         // why now, not 5 years ago
  counterPositioning: string | null   // why incumbents can't respond
  valueChainPosition: string | null   // where you sit
  winnerTakeAllScore: number | null   // 1-10, network effects + data moats
}

export interface FounderPrimitives {
  founderMarketFit: string | null     // why YOU for THIS problem
  uniqueInsight: string | null        // what you know others don't
  obsessionLevel: number | null       // 1-10
  learningVelocity: string | null     // how fast they iterate
  resilienceEvidence: string | null   // past adversity handled
  decisionFramework: string | null    // how they make hard calls
}

export interface TeamPrimitives {
  chemistryScore: number | null       // 1-10
  conflictStyle: string | null        // how they disagree + resolve
  skillComplementarity: string | null // gaps covered
  equityAlignment: string | null      // fair, clear, settled
  commitmentLevel: string | null      // full-time, burned boats
  communicationPattern: string | null // frequency, honesty
  worstMomentStory: string | null     // how they handled crisis
}

export interface TractionPrimitives {
  organicPull: string | null          // users finding you without marketing
  activationRate: string | null       // % who reach aha moment
  retentionCurve: string | null       // cohort behavior
  wordOfMouthCoefficient: string | null // referral rate
  willingnessToPay: string | null     // evidence of payment
  loveSignal: string | null           // what users say unsolicited
}

export interface EconomicsPrimitives {
  unitEconomics: string | null        // LTV:CAC, margin per customer
  pricingPower: string | null         // can you raise prices?
  costStructure: string | null        // fixed vs. variable
  capitalEfficiency: string | null    // output per $ spent
  revenueQuality: string | null       // recurring vs. one-time
  pathToProfitability: string | null  // when, how
}

export interface StartupPrimitives {
  problem: ProblemPrimitives
  solution: SolutionPrimitives
  market: MarketPrimitives
  founder: FounderPrimitives
  team: TeamPrimitives
  traction: TractionPrimitives
  economics: EconomicsPrimitives
}

// Factory for an empty primitives object
export function createEmptyPrimitives(): StartupPrimitives {
  return {
    problem: {
      painIntensity: null, painFrequency: null, painOwner: null,
      currentSpend: null, urgencyTrigger: null, hairOnFireMoment: null,
    },
    solution: {
      tenXFactor: null, ahaMoment: null, timeToValue: null,
      switchingCost: null, lockInMechanism: null, failureMode: null,
    },
    market: {
      wedge: null, expandPath: null, marketTiming: null,
      counterPositioning: null, valueChainPosition: null, winnerTakeAllScore: null,
    },
    founder: {
      founderMarketFit: null, uniqueInsight: null, obsessionLevel: null,
      learningVelocity: null, resilienceEvidence: null, decisionFramework: null,
    },
    team: {
      chemistryScore: null, conflictStyle: null, skillComplementarity: null,
      equityAlignment: null, commitmentLevel: null, communicationPattern: null,
      worstMomentStory: null,
    },
    traction: {
      organicPull: null, activationRate: null, retentionCurve: null,
      wordOfMouthCoefficient: null, willingnessToPay: null, loveSignal: null,
    },
    economics: {
      unitEconomics: null, pricingPower: null, costStructure: null,
      capitalEfficiency: null, revenueQuality: null, pathToProfitability: null,
    },
  }
}

// -----------------------------------------------------
// V2 INTERVIEW SIGNALS (richer than V1)
// -----------------------------------------------------

export const V2_SIGNAL_TYPES = [
  'founder_signal',
  'team_signal',
  'problem_signal',
  'user_signal',
  'solution_signal',
  'market_signal',
  'traction_signal',
  'economics_signal',
  'risk_flag',
  'red_flag',
  'green_flag',
  'strength',
  'quote',
  'data_point',
] as const

export type V2SignalType = (typeof V2_SIGNAL_TYPES)[number]

export interface InterviewSignalV2 {
  type: V2SignalType
  content: string
  dimension: InterviewDimensionV2
  impact: number                       // -5 to +5
  technique: QuestioningTechnique | null // which technique surfaced this
  verbatimQuote: string | null         // exact founder words if applicable
  primitiveKey: string | null          // e.g. "problem.painIntensity" — which primitive this populates
  confidence: number                   // 0-1
}

// -----------------------------------------------------
// V2 AGENT RESPONSE
// -----------------------------------------------------

export interface InterviewResponseV2 {
  response: string
  shouldTransition: boolean
  isComplete: boolean
  signals: InterviewSignalV2[]
  primitivesUpdate: Partial<StartupPrimitives> | null  // incremental primitive updates
  techniqueUsed: QuestioningTechnique | null
  dimensionCoverage: Record<InterviewDimensionV2, number> // 0-100% per dimension
}

// -----------------------------------------------------
// FOUNDER CHEMISTRY MATRIX
// -----------------------------------------------------

export type ChemistryRating = 'strong' | 'adequate' | 'concerning' | 'red_flag' | 'unknown'

export interface ChemistryDimension {
  rating: ChemistryRating
  signal: string | null       // observed positive signal
  redFlag: string | null      // observed concern
  evidence: string | null     // specific quote or moment
}

export interface FounderChemistryAssessment {
  overall: number                                // 1-10
  trust: ChemistryDimension
  conflictStyle: ChemistryDimension
  communication: ChemistryDimension
  equityClarity: ChemistryDimension
  roleClarity: ChemistryDimension
  commitmentMatch: ChemistryDimension
  worstMoment: ChemistryDimension
  mutualRespect: ChemistryDimension
}

export function createEmptyChemistryAssessment(): FounderChemistryAssessment {
  const empty: ChemistryDimension = { rating: 'unknown', signal: null, redFlag: null, evidence: null }
  return {
    overall: 0,
    trust: { ...empty },
    conflictStyle: { ...empty },
    communication: { ...empty },
    equityClarity: { ...empty },
    roleClarity: { ...empty },
    commitmentMatch: { ...empty },
    worstMoment: { ...empty },
    mutualRespect: { ...empty },
  }
}

// -----------------------------------------------------
// STARTUP DNA REPORT (the V2 output)
// -----------------------------------------------------

export type DNARecommendation = 'strong_accept' | 'accept' | 'conditional' | 'waitlist' | 'decline'

export interface DNAReportExecutiveSummary {
  oneLineThesis: string
  convictionScore: number           // 1-10
  convictionReasoning: string
  primaryRisk: string
  primaryStrength: string
}

export interface DNAReportProblemCrux {
  problem: string                   // one sentence, crystal clear
  painIntensity: number             // 1-10
  painEvidence: string
  painFrequency: string
  painOwner: string
  currentSolution: string
  currentSpend: string
  hairOnFireMoment: string
  userQuote: string | null
}

export interface DNAReportSolutionThesis {
  solution: string                  // one sentence
  tenXFactor: string
  ahaMoment: string
  timeToValue: string
  whyNotSimpler: string
  failureMode: string
}

export interface DNAReportMarketPosition {
  marketSize: string                // honest TAM/SAM/SOM
  wedge: string
  expandPath: string
  whyNow: string
  counterPosition: string
  competitors: string
}

export interface DNAReportFounderAssessment {
  founderMarketFit: string
  founderMarketFitScore: number     // 1-10
  uniqueInsight: string
  obsessionLevel: string
  learningVelocity: string
  resilienceEvidence: string
}

export interface DNAReportTeamChemistry {
  chemistryScore: number            // 1-10
  conflictStyle: string
  equityStatus: 'settled' | 'unclear' | 'concerning'
  commitmentMatch: 'aligned' | 'misaligned'
  worstMoment: string
  redFlags: string[]
}

export interface DNAReportTractionEvidence {
  usersCustomers: string
  revenue: string
  growthRate: string
  retention: string
  organicPull: string
  loveSignals: string
}

export interface DNAReportRisk {
  risk: string
  evidence: string
  severity: 'critical' | 'moderate' | 'low'
}

export interface DNAReportKeyQuote {
  topic: string                     // e.g. "On Problem", "On Users"
  quote: string
  isRedFlag: boolean
  isGreenFlag: boolean
}

export interface DNAReportSanctuaryFit {
  whatTheyNeed: string
  mentorMatch: string
  successMetrics: string
  recommendation: DNARecommendation
  recommendationReasoning: string
}

export interface StartupDNAReport {
  // Metadata
  companyName: string
  generatedAt: string
  interviewId: string
  applicationId: string
  version: 'v2'

  // Sections
  executiveSummary: DNAReportExecutiveSummary
  problemCrux: DNAReportProblemCrux
  solutionThesis: DNAReportSolutionThesis
  marketPosition: DNAReportMarketPosition
  founderAssessment: DNAReportFounderAssessment
  teamChemistry: DNAReportTeamChemistry
  tractionEvidence: DNAReportTractionEvidence

  // Risk matrix
  criticalRisks: DNAReportRisk[]
  moderateConcerns: DNAReportRisk[]
  strengths: DNAReportRisk[]        // reuse shape: strength + evidence + impact level

  // Verbatim quotes
  keyQuotes: DNAReportKeyQuote[]

  // Sanctuary fit & recommendation
  sanctuaryFit: DNAReportSanctuaryFit

  // Raw data
  primitives: StartupPrimitives
  chemistry: FounderChemistryAssessment
  totalSignals: number
  totalVerbatimQuotes: number
}

// -----------------------------------------------------
// INTERVIEW SESSION STATE (V2)
// -----------------------------------------------------

export interface InterviewSessionV2 {
  interviewId: string
  applicationId: string
  currentDimension: InterviewDimensionV2
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned'

  // Accumulated state
  primitives: StartupPrimitives
  chemistry: FounderChemistryAssessment
  signals: InterviewSignalV2[]
  dimensionCoverage: Record<InterviewDimensionV2, number>

  // Timing
  startedAt: string | null
  completedAt: string | null
  dimensionStartedAt: string | null
}

export function createInterviewSessionV2(
  interviewId: string,
  applicationId: string
): InterviewSessionV2 {
  return {
    interviewId,
    applicationId,
    currentDimension: 'founder_core',
    status: 'not_started',
    primitives: createEmptyPrimitives(),
    chemistry: createEmptyChemistryAssessment(),
    signals: [],
    dimensionCoverage: {
      founder_core: 0,
      team_chemistry: 0,
      problem_anatomy: 0,
      user_reality: 0,
      solution_thesis: 0,
      market_mechanics: 0,
      traction_truth: 0,
      growth_path: 0,
    },
    startedAt: null,
    completedAt: null,
    dimensionStartedAt: null,
  }
}
