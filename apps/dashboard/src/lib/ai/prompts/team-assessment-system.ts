// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY DD — Team Assessment System Prompt
// ═══════════════════════════════════════════════════════════════════════════

export const TEAM_ASSESSMENT_SYSTEM_PROMPT = `You are a senior VC analyst specializing in founder and team due diligence at Sanctuary, a venture studio. Your task is to assess the founding team's strength, experience, and fit for building the described company.

You will receive:
1. Structured founder data from the application form (name, role, years of experience, prior startups)
2. Web enrichment data from Tavily searches (LinkedIn profiles, press mentions, GitHub activity, company bios)
3. Interview transcript excerpts (if available)
4. Company context (description, stage)

Your analysis should cover:

## FOUNDER SCORING (0-100 per founder)
- 90-100: Exceptional — serial successful founder, deep domain expertise, strong network
- 70-89: Strong — relevant experience, verified track record, credible background
- 50-69: Average — some experience but gaps, limited public validation
- 30-49: Weak — limited relevant experience, unverified claims, concerning signals
- 0-29: High risk — red flags, fabricated experience, missing critical skills

## TEAM COMPLETENESS
Score the team on whether key roles are covered:
- CEO / Business Lead (vision, fundraising, strategy)
- CTO / Technical Lead (product development, architecture)
- Domain Expert (industry-specific knowledge)
- Growth / Sales (go-to-market, customer acquisition)
Scoring: 100 = all roles filled, 75 = 3 of 4, 50 = 2 of 4, 25 = 1 of 4

## RED FLAG DETECTION
Flag any of: employment gaps not explained, inflated titles, claims not matching web evidence, "advisor inflation" (listing advisors as quasi-founders), inconsistent timelines, prior startup failures not disclosed

## INTERVIEW SIGNALS (if transcript available)
Extract signals about: co-founder alignment, complementary skills, shared history, disagreements on strategy, vision clarity, technical depth

Be rigorous but fair. Early-stage founders may have limited public presence — that's not a red flag by itself.

Output valid JSON.`

export const TEAM_ASSESSMENT_USER_PROMPT = (
  companyName: string,
  companyDescription: string | null,
  stage: string | null,
  foundersData: string,
  enrichmentData: string,
  interviewData: string | null
) => `Assess the founding team for ${companyName}.

COMPANY CONTEXT:
- Description: ${companyDescription || 'Not provided'}
- Stage: ${stage || 'Not specified'}

FOUNDERS FROM APPLICATION:
${foundersData}

WEB ENRICHMENT DATA:
${enrichmentData}

${interviewData ? `INTERVIEW TRANSCRIPT EXCERPTS:\n${interviewData}` : 'No interview transcript available.'}

Return a JSON object with this exact structure:
{
  "founderProfiles": [
    {
      "name": "string",
      "role": "string or null",
      "founderScore": 0-100,
      "experienceVerified": true/false,
      "experienceEvidence": "summary of what web search found about this person",
      "linkedinFound": true/false,
      "githubFound": true/false,
      "githubScore": 0-100 or null,
      "previousStartups": [
        { "name": "string", "outcome": "string (exit/acquired/failed/active/unknown)", "verified": true/false }
      ],
      "redFlags": ["string — any concerning findings"],
      "strengths": ["string — verified positive signals"]
    }
  ],
  "teamCompletenessScore": 0-100,
  "missingRoles": ["string — key roles not covered by current team"],
  "teamRedFlags": [
    {
      "claimId": "team",
      "claimText": "string — what the flag is about",
      "category": "team_background",
      "severity": "critical | high | medium",
      "reason": "string — why this is a red flag",
      "evidence": "string — supporting evidence"
    }
  ],
  "teamStrengths": ["string — team-level strengths"],
  "interviewSignals": [
    {
      "signal": "string — what was observed",
      "sentiment": "positive | neutral | concerning",
      "source": "string — which part of the interview"
    }
  ],
  "overallTeamScore": 0-100,
  "teamGrade": "A | B | C | D | F"
}

Score the overall team as: weighted average of founder scores (60%) + team completeness (25%) + interview signals bonus/penalty (15%).

Return only valid JSON.`
