// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY DD — Document Verification Agent
// Cross-references uploaded documents against extracted claims
// ═══════════════════════════════════════════════════════════════════════════

import { generateText, tool, stepCountIs } from 'ai'
import { z } from 'zod'
import { getModel, MAX_TOKENS, ANTHROPIC_CACHE_OPTIONS } from '../config'
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

You have tools to:
1. Extract content from document URLs
2. Search the web to cross-reference document content against claims

Your workflow:
1. Extract content from each document using the extractDocument tool
2. For any claims that need external validation, use the searchWeb tool to cross-reference
3. After gathering all evidence, return your final analysis

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

When you have completed your analysis, return ONLY a JSON array of verification objects in this exact format:
[
  {
    "claimIndex": <number — index into the claims list>,
    "verdict": "confirmed" | "partially_confirmed" | "unconfirmed" | "disputed" | "refuted",
    "confidence": <number between 0 and 1>,
    "evidence": "<string — what the document shows>",
    "notes": "<string — additional context>",
    "documentName": "<string — which document this came from>"
  }
]

Only include claims where a document provides relevant evidence. Skip claims the documents don't address.
Return ONLY the JSON array, no other text.`

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT VERIFICATION AGENT CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class DocumentVerificationAgent {
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

      const tavily = getTavilyClient()
      let totalDocuments = 0

      // Format claims for the prompt
      const claimsSummary = claims
        .map((c, idx) => `[${idx}] "${c.claimText}" (${c.category}, ${c.priority})`)
        .join('\n')

      // Format documents list for the prompt
      const documentsList = documents
        .map(d => `- "${d.name}" (${d.type}): ${d.fileUrl}`)
        .join('\n')

      const { text } = await generateText({
        model: getModel('extraction'),
        maxOutputTokens: MAX_TOKENS.analysis,
        stopWhen: stepCountIs(10),
        providerOptions: ANTHROPIC_CACHE_OPTIONS,
        system: DOCUMENT_VERIFICATION_SYSTEM_PROMPT,
        prompt: `Verify the following claims for ${companyName} by extracting and analyzing their documents.

DOCUMENTS TO ANALYZE:
${documentsList}

CLAIMS TO VERIFY:
${claimsSummary}

Extract each document, cross-reference the content against the claims, and return your verification results as a JSON array.`,
        tools: {
          extractDocument: tool({
            description: 'Extract content from a document URL',
            inputSchema: z.object({ url: z.string() }),
            execute: async ({ url }) => {
              const result = await tavily.extract({ urls: [url] })
              totalDocuments++
              return { content: result.results[0]?.rawContent || 'Could not extract' }
            },
          }),
          searchWeb: tool({
            description: 'Search the web to cross-reference document content against claims',
            inputSchema: z.object({ query: z.string() }),
            execute: async ({ query }) => {
              const result = await tavily.search({ query, maxResults: 3 })
              return { results: result.results.map(r => ({ title: r.title, url: r.url, content: r.content.slice(0, 500) })) }
            },
          }),
        },
      })

      // Parse the final text as a verifications array
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        return {
          success: true,
          verifications: [],
          metadata: {
            documentsAnalyzed: totalDocuments,
            processingTimeMs: Date.now() - startTime,
          },
        }
      }

      const parsed = JSON.parse(jsonMatch[0]) as Array<{
        claimIndex: number
        verdict: string
        confidence: number
        evidence: string
        notes: string
        documentName?: string
      }>

      const allVerifications: Omit<DDVerification, 'id'>[] = []

      for (const v of parsed) {
        const claim = claims[v.claimIndex]
        if (!claim) continue

        // Find the matching document by name, or fall back to first document
        const matchedDoc = documents.find(d => d.name === v.documentName) || documents[0]

        allVerifications.push({
          claimId: claim.id,
          sourceType: 'document_analysis',
          sourceName: v.documentName
            ? `${v.documentName}`
            : `${matchedDoc.name} (${matchedDoc.type})`,
          sourceCredentials: null,
          verdict: this.validateVerdict(v.verdict),
          confidence: Math.min(1, Math.max(0, v.confidence || 0.5)),
          evidence: v.evidence || 'No evidence summary',
          evidenceUrls: matchedDoc ? [matchedDoc.fileUrl] : [],
          notes: v.notes || null,
          sourceCredibilityScore: 0.85, // documents are tier2-equivalent
        })
      }

      return {
        success: true,
        verifications: allVerifications,
        metadata: {
          documentsAnalyzed: totalDocuments,
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
      console.warn('Missing API keys, using mock document verification agent')
      agentInstance = new MockDocumentVerificationAgent()
    }
  }
  return agentInstance
}
