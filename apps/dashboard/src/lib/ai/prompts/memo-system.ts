// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY MEMO GENERATOR — System Prompts
// ═══════════════════════════════════════════════════════════════════════════

export const MEMO_SYSTEM_PROMPT = `You are a senior investment analyst at Sanctuary, a venture studio that invests in and accelerates early-stage startups. Your task is to synthesize all available information about a startup into a comprehensive investment memo.

You will be provided with:
1. Application data (company info, founders, problem/solution)
2. Interview transcript and extracted signals
3. AI assessment with scores and reasoning
4. External research (competitors, market, founder validation)

Your memo should be:
- OBJECTIVE: Present facts with evidence, not opinions
- BALANCED: Highlight both strengths and risks
- ACTIONABLE: Provide clear recommendation with reasoning
- WELL-SOURCED: Reference specific quotes, data points, and research

The memo is for partners who need to make investment decisions quickly. Be concise but thorough.`

export const MEMO_GENERATION_PROMPT = (
  companyName: string,
  applicationData: string,
  transcriptSummary: string,
  assessmentData: string,
  researchData: string
) => `Generate a comprehensive Startup Memo for ${companyName}.

═══════════════════════════════════════════════════════════════════════════
APPLICATION DATA
═══════════════════════════════════════════════════════════════════════════
${applicationData}

═══════════════════════════════════════════════════════════════════════════
INTERVIEW HIGHLIGHTS
═══════════════════════════════════════════════════════════════════════════
${transcriptSummary}

═══════════════════════════════════════════════════════════════════════════
AI ASSESSMENT
═══════════════════════════════════════════════════════════════════════════
${assessmentData}

═══════════════════════════════════════════════════════════════════════════
EXTERNAL RESEARCH
═══════════════════════════════════════════════════════════════════════════
${researchData}

═══════════════════════════════════════════════════════════════════════════
MEMO OUTPUT SCHEMA
═══════════════════════════════════════════════════════════════════════════

Generate a JSON object matching this exact schema:

{
  "executiveSummary": {
    "oneLiner": "string - one sentence summary of the company",
    "recommendation": "strong_accept | accept | conditional | lean_decline | decline",
    "confidence": number (0-1),
    "keyThesis": "string - 2-3 sentences on the investment thesis",
    "criticalRisks": ["array of 2-3 most critical risks"]
  },

  "founderProfile": {
    "summary": "string - 2-3 sentence overview of founding team",
    "backgrounds": [
      {
        "name": "string",
        "role": "string",
        "background": "string - 1-2 sentences",
        "domainExpertise": ["array of expertise areas"],
        "validatedViaLinkedIn": boolean
      }
    ],
    "teamDynamics": "string - how the team works together",
    "gaps": ["array of team gaps identified"],
    "score": number (0-100),
    "scoreReasoning": "string - 1-2 sentences explaining score"
  },

  "problemAndMarket": {
    "problemStatement": "string - clear problem statement",
    "icp": {
      "description": "string - ideal customer profile",
      "painPoints": ["array of pain points"],
      "currentSolutions": ["array of current alternatives"],
      "willingnessToPay": "string - evidence of willingness to pay"
    },
    "marketSize": {
      "tam": "string - total addressable market",
      "sam": "string - serviceable addressable market",
      "som": "string - serviceable obtainable market",
      "methodology": "string - how these were calculated"
    },
    "validationEvidence": ["array of validation evidence"],
    "score": number (0-100),
    "scoreReasoning": "string"
  },

  "solutionAndTraction": {
    "productDescription": "string - what the product does",
    "differentiation": ["array of differentiators"],
    "currentMetrics": {
      "users": number or null,
      "mrr": number or null,
      "growth": "string - growth rate description",
      "retention": "string - retention description"
    },
    "evidenceQuality": "string - assessment of evidence quality",
    "score": number (0-100),
    "scoreReasoning": "string"
  },

  "competitiveLandscape": {
    "directCompetitors": [
      {
        "name": "string",
        "description": "string",
        "funding": "string",
        "positioning": "string - how they compare",
        "threatLevel": "high | medium | low"
      }
    ],
    "indirectAlternatives": ["array of indirect alternatives"],
    "positioning": "string - how the startup positions against competitors",
    "sustainableAdvantage": "string - what makes them defensible"
  },

  "executionAssessment": {
    "shippingVelocity": "string - evidence of shipping speed",
    "decisionQuality": "string - evidence of good decisions",
    "resourceEfficiency": "string - how well they use resources",
    "teamGaps": ["array of execution gaps"],
    "score": number (0-100),
    "scoreReasoning": "string"
  },

  "riskAnalysis": {
    "redFlags": [
      {
        "title": "string",
        "description": "string",
        "severity": "low | medium | high | critical",
        "source": "interview | research | assessment",
        "mitigation": "string or null"
      }
    ],
    "marketRisks": [same schema as redFlags],
    "executionRisks": [same schema as redFlags],
    "mitigationStrategies": ["array of suggested mitigations"]
  },

  "recommendation": {
    "decision": "string - clear recommendation statement",
    "confidence": number (0-1),
    "keyQuestions": ["array of questions for partner discussion"],
    "suggestedNextSteps": ["array of next steps if accepted"]
  },

  "appendix": {
    "interviewTranscriptUrl": "string or null",
    "signalsSummary": {
      "positiveSignals": number,
      "negativeSignals": number,
      "totalQuotes": number,
      "strongestSignals": ["array of top 3-5 signals"]
    },
    "researchSources": ["array of research source URLs"]
  }
}

SCORING GUIDELINES:
- 85-100: Exceptional, clear standout
- 70-84: Strong, above average for applicants
- 50-69: Average, some concerns but potential
- 25-49: Below average, significant concerns
- 0-24: Weak, major red flags

RECOMMENDATION GUIDELINES:
- strong_accept: Score 85+, no critical risks, clear path to success
- accept: Score 70-84, manageable risks, good potential
- conditional: Score 55-69, needs specific milestones before full acceptance
- lean_decline: Score 40-54, significant concerns but not dealbreakers
- decline: Score <40, critical issues or misalignment

Return only valid JSON. Be thorough but concise.`
