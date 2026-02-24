// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY DD — Document Verification Agent
// Cross-references uploaded documents against extracted claims
// ═══════════════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk'
import { getTavilyClient } from '@/lib/research/tavily-client'
import type {
  DDClaim,
  DDVerification,
  DocumentVerificationInput,
  DocumentVerificationResult,
} from '../types/due-diligence'

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════════════════

const DOCUMENT_VERIFICATION_SYSTEM_PROMPT = `You are a due diligence document analyst at Sanctuary, a venture studio. Your job is to cross-reference startup documents (pitch decks, financial statements, legal documents, product screenshots) against factual claims made in their application.

For each claim, determine:
- Does the document support the claim?
- Does the document contradict the claim?
- Is the information in the document consistent with what was stated?

Focus on:
- Financial numbers: Do pitch deck financials match application MRR/revenue claims?
- Team information: Do team slides match founder background claims?
- Customer logos/references: Do referenced customers appear in documents?
- Product features: Do product screenshots match solution claims?
- Market data: Do cited market sizes match research reports?

Be precise and factual. Only report what you can clearly see in the document content.

Output valid JSON.`

const DOCUMENT_ANALYSIS_PROMPT = (
  companyName: string,
  documentContent: string,
  claimsSummary: string
) => `Cross-reference the following document content from ${companyName} against their claims.

DOCUMENT CONTENT:
${documentContent}

CLAIMS TO VERIFY:
${claimsSummary}

For each claim that can be verified or contradicted by this document, return a verdict.

{
  "verifications": [
    {
      "claimIndex": number,
      "verdict": "confirmed | partially_confirmed | unconfirmed | disputed | refuted",
      "confidence": number between 0 and 1,
      "evidence": "string — what the document shows",
      "notes": "string — additional context"
    }
  ]
}

Only include claims where the document provides relevant evidence. Skip claims the document doesn't address.

Return only valid JSON.`

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT VERIFICATION AGENT CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class DocumentVerificationAgent {
  private client: Anthropic
  private tavily = getTavilyClient()
  private model = 'claude-sonnet-4-20250514'

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  async verifyDocuments(input: DocumentVerificationInput): Promise<DocumentVerificationResult> {
    const startTime = Date.now()

    try {
      const { claims, documents, companyName } = input

      if (documents.length === 0) {
        return {
          success: true,
          verifications: [],
          metadata: {
            documentsAnalyzed: 0,
            processingTimeMs: Date.now() - startTime,
          },
        }
      }

      const allVerifications: Omit<DDVerification, 'id'>[] = []

      // Process each document
      for (const doc of documents) {
        try {
          // Extract document content using Tavily
          const extractResult = await this.tavily.extract({ urls: [doc.fileUrl] })
          const content = extractResult.results[0]?.rawContent

          if (!content) continue

          // Format claims for comparison
          const claimsSummary = claims
            .map((c, idx) => `[${idx}] "${c.claimText}" (${c.category}, ${c.priority})`)
            .join('\n')

          // Truncate content if too long
          const truncatedContent = content.length > 8000
            ? content.substring(0, 8000) + '\n...[truncated]'
            : content

          const prompt = DOCUMENT_ANALYSIS_PROMPT(companyName, truncatedContent, claimsSummary)

          const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 2048,
            system: DOCUMENT_VERIFICATION_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: prompt }],
          })

          const textContent = response.content.find(c => c.type === 'text')
          if (!textContent || textContent.type !== 'text') continue

          const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
          if (!jsonMatch) continue

          const parsed = JSON.parse(jsonMatch[0])
          const docVerifications = parsed.verifications || []

          for (const v of docVerifications) {
            const claim = claims[v.claimIndex]
            if (!claim) continue

            allVerifications.push({
              claimId: claim.id,
              sourceType: 'document_analysis',
              sourceName: `${doc.name} (${doc.type})`,
              sourceCredentials: null,
              verdict: this.validateVerdict(v.verdict),
              confidence: Math.min(1, Math.max(0, v.confidence || 0.5)),
              evidence: v.evidence || 'No evidence summary',
              evidenceUrls: [doc.fileUrl],
              notes: v.notes || null,
              sourceCredibilityScore: 0.85, // documents are tier2-equivalent
            })
          }
        } catch (docError) {
          console.error(`Error processing document ${doc.name}:`, docError)
          // Continue with other documents
        }
      }

      return {
        success: true,
        verifications: allVerifications,
        metadata: {
          documentsAnalyzed: documents.length,
          processingTimeMs: Date.now() - startTime,
        },
      }
    } catch (error) {
      console.error('Document verification error:', error)
      return {
        success: false,
        verifications: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          documentsAnalyzed: 0,
          processingTimeMs: Date.now() - startTime,
        },
      }
    }
  }

  private validateVerdict(verdict: string): DDVerification['verdict'] {
    const valid = ['confirmed', 'partially_confirmed', 'unconfirmed', 'disputed', 'refuted']
    return valid.includes(verdict) ? (verdict as DDVerification['verdict']) : 'unconfirmed'
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DOCUMENT VERIFICATION AGENT
// ═══════════════════════════════════════════════════════════════════════════

export class MockDocumentVerificationAgent {
  async verifyDocuments(input: DocumentVerificationInput): Promise<DocumentVerificationResult> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (input.documents.length === 0) {
      return {
        success: true,
        verifications: [],
        metadata: { documentsAnalyzed: 0, processingTimeMs: 1000 },
      }
    }

    // Mock: verify first 2 claims from each document
    const verifications: Omit<DDVerification, 'id'>[] = input.documents
      .slice(0, 2)
      .flatMap(doc =>
        input.claims.slice(0, 2).map(claim => ({
          claimId: claim.id,
          sourceType: 'document_analysis' as const,
          sourceName: `${doc.name} [MOCK]`,
          sourceCredentials: null,
          verdict: 'partially_confirmed' as const,
          confidence: 0.65,
          evidence: `[MOCK] Document "${doc.name}" provides partial support for this claim.`,
          evidenceUrls: [doc.fileUrl],
          notes: '[MOCK] Simulated document verification.',
          sourceCredibilityScore: 0.85,
        }))
      )

    return {
      success: true,
      verifications,
      metadata: {
        documentsAnalyzed: input.documents.length,
        processingTimeMs: 1000,
      },
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

let agentInstance: DocumentVerificationAgent | MockDocumentVerificationAgent | null = null

export function getDocumentVerificationAgent(): DocumentVerificationAgent | MockDocumentVerificationAgent {
  if (!agentInstance) {
    if (process.env.ANTHROPIC_API_KEY && process.env.TAVILY_API_KEY) {
      agentInstance = new DocumentVerificationAgent()
    } else {
      console.log('Missing API keys, using mock document verification agent')
      agentInstance = new MockDocumentVerificationAgent()
    }
  }
  return agentInstance
}
