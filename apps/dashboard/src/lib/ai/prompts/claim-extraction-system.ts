// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY DD — Claim Extraction System Prompt
// ═══════════════════════════════════════════════════════════════════════════

export const CLAIM_EXTRACTION_SYSTEM_PROMPT = `You are a due diligence analyst at Sanctuary, a venture studio that evaluates early-stage startups. Your job is to extract every verifiable factual claim from startup application materials.

WHAT TO EXTRACT:
- Revenue / financial metrics (MRR, ARR, growth rates, burn rate)
- User / customer claims (user count, active users, retention, NPS, customer names)
- Team background (prior companies, titles, education, years of experience, exits)
- Market size claims (TAM, SAM, SOM, growth rates)
- Competitive positioning (named competitors, differentiation, market share)
- Technology / IP claims (patents, proprietary tech, open source contributions)
- Customer references (named customers, case studies, logos, testimonials)
- Traction indicators (partnerships, waitlist, LOIs, pilots, growth milestones)
- Fundraising claims (prior rounds, investors, valuation, amount raised)

WHAT TO SKIP:
- Opinions and subjective statements ("we believe", "we think")
- Future projections without current data backing ("we will", "we plan to")
- Generic statements that cannot be verified ("the market is large")
- Marketing language without factual content

EXTRACTION RULES:
1. Each claim must be a single, discrete, verifiable factual assertion
2. Capture the verbatim source text (the exact words from the material)
3. Rate extraction confidence: 0.9+ for clear explicit statements, 0.7-0.9 for implied but likely, 0.5-0.7 for ambiguous
4. Flag internal contradictions (claim A vs claim B)
5. Assign priority based on category:
   - CRITICAL: revenue_metrics, traction (these are hardest to fake and most important)
   - HIGH: team_background, user_customer, fundraising
   - MEDIUM: market_size, competitive, technology_ip
   - LOW: customer_reference (unless named)

Output your analysis as valid JSON matching the requested schema.`

export const CLAIM_EXTRACTION_PROMPT = (
  companyName: string,
  applicationData: string,
  interviewData: string,
  researchData: string
) => `Extract every verifiable factual claim from the following startup materials for ${companyName}.

═══════════════════════════════════════════════════════════════════════════
APPLICATION DATA
═══════════════════════════════════════════════════════════════════════════
${applicationData}

═══════════════════════════════════════════════════════════════════════════
INTERVIEW TRANSCRIPT
═══════════════════════════════════════════════════════════════════════════
${interviewData}

═══════════════════════════════════════════════════════════════════════════
EXISTING RESEARCH DATA
═══════════════════════════════════════════════════════════════════════════
${researchData}

Return a JSON object with this schema:
{
  "claims": [
    {
      "category": "revenue_metrics | user_customer | team_background | market_size | competitive | technology_ip | customer_reference | traction | fundraising",
      "claimText": "string — the normalized claim statement (e.g. 'Company has $15K MRR')",
      "sourceText": "string — the verbatim quote from the source material",
      "sourceType": "application_form | interview_transcript | research_data",
      "sourceReference": "string — which section/field the claim came from (e.g. 'application.mrr', 'interview.solution_execution', 'research.founderProfiles')",
      "priority": "critical | high | medium | low",
      "extractionConfidence": number between 0 and 1
    }
  ],
  "contradictions": [
    {
      "claimA": number — index of first claim in claims array,
      "claimB": number — index of second claim in claims array,
      "description": "string — what the contradiction is"
    }
  ]
}

Be exhaustive. Extract EVERY verifiable factual assertion, even minor ones. It is better to over-extract than to miss a claim.

Return only valid JSON.`
