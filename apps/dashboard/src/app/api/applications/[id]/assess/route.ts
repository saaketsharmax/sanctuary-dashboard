import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'
import { getAssessmentAgent, type AssessmentInput } from '@/lib/ai/agents/assessment-agent'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Generate assessment for an application
export async function POST(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now()
  const { id: applicationId } = await params

  try {
    // Require Supabase to be configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = createDb({ type: 'supabase-client', client: supabase })

    // Check if user is a partner
    const { data: userProfile } = await db.users.getUserType(user.id)

    if (userProfile?.user_type !== 'partner') {
      return NextResponse.json(
        { error: 'Only partners can trigger assessments' },
        { status: 403 }
      )
    }

    // Fetch the application with all data
    const { data: application, error: fetchError } = await db.applications.getById(applicationId)

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check if interview is completed
    if (!(application as any).interview_transcript || (application as any).interview_transcript.length === 0) {
      return NextResponse.json(
        { error: 'Interview must be completed before assessment' },
        { status: 400 }
      )
    }

    // Fetch signals if available
    const { data: signals } = await db.applications.getSignals(applicationId)

    // Build assessment input
    const assessmentInput: AssessmentInput = {
      applicationId,
      companyName: (application as any).company_name,
      applicationData: {
        companyOneLiner: (application as any).company_one_liner,
        companyDescription: (application as any).company_description,
        problemDescription: (application as any).problem_description,
        targetCustomer: (application as any).target_customer,
        solutionDescription: (application as any).solution_description,
        stage: (application as any).stage,
        userCount: (application as any).user_count,
        mrr: (application as any).mrr,
        biggestChallenge: (application as any).biggest_challenge,
        whySanctuary: (application as any).why_sanctuary,
        whatTheyWant: (application as any).what_they_want,
        founders: (application as any).founders || [],
      },
      transcript: (application as any).interview_transcript,
      signals: ((signals || []) as { signal_type: string; content: string; dimension: string; impact_score: number }[]).map((s) => ({
        type: s.signal_type,
        content: s.content,
        dimension: s.dimension,
        impact: s.impact_score,
      })),
    }

    // Generate assessment
    const agent = getAssessmentAgent()
    const result = await agent.generateAssessment(assessmentInput)

    if (!result.success || !result.assessment) {
      // Log the agent run as failed
      await db.dd.logAgentRun({
        agent_type: 'assessment',
        agent_version: 'v1.0',
        application_id: applicationId,
        triggered_by: user.id,
        trigger_type: 'manual',
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        status: 'failed',
        error_message: result.error,
        run_metadata: {
          model: result.metadata.model_used,
          prompt_version: result.metadata.prompt_version,
          performance: {
            latency_ms: result.metadata.generation_time_ms,
            retries: 0,
            rate_limited: false,
          },
        },
      })

      return NextResponse.json(
        { error: 'Failed to generate assessment', details: result.error },
        { status: 500 }
      )
    }

    // Transform assessment for database storage
    const aiAssessment = {
      founderScore: result.assessment.founderScore,
      founderReasoning: result.assessment.founderReasoning,
      problemScore: result.assessment.problemScore,
      problemReasoning: result.assessment.problemReasoning,
      userValueScore: result.assessment.userValueScore,
      userValueReasoning: result.assessment.userValueReasoning,
      executionScore: result.assessment.executionScore,
      executionReasoning: result.assessment.executionReasoning,
      overallScore: result.assessment.overallScore,
      recommendation: result.assessment.recommendation,
      recommendationConfidence: result.assessment.recommendationConfidence,
      oneLineSummary: result.assessment.oneLineSummary,
      keyStrengths: result.assessment.keyStrengths,
      keyRisks: result.assessment.keyRisks,
      criticalQuestions: result.assessment.criticalQuestions,
      primaryNeed: result.assessment.primaryNeed,
      secondaryNeeds: result.assessment.secondaryNeeds,
      mentorDomains: result.assessment.mentorDomains,
    }

    // Save assessment to application
    const { error: updateError } = await db.applications.update(applicationId, {
      ai_assessment: aiAssessment,
      ai_score: result.assessment.overallScore / 100, // Store as 0-1 decimal
      assessment_metadata: result.metadata,
    })

    if (updateError) {
      console.error('Failed to save assessment:', updateError)
      return NextResponse.json(
        { error: 'Failed to save assessment', details: updateError.message },
        { status: 500 }
      )
    }

    // Log successful agent run
    await db.dd.logAgentRun({
      agent_type: 'assessment',
      agent_version: 'v1.0',
      application_id: applicationId,
      triggered_by: user.id,
      trigger_type: 'manual',
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      status: 'completed',
      input_summary: {
        company_name: (application as any).company_name,
        transcript_length: (application as any).interview_transcript.length,
        signals_count: signals?.length || 0,
      },
      output_summary: {
        overall_score: result.assessment.overallScore,
        recommendation: result.assessment.recommendation,
        confidence: result.assessment.confidence.overall,
      },
      run_metadata: {
        model: result.metadata.model_used,
        prompt_version: result.metadata.prompt_version,
        rubric_version: result.metadata.scoring_rubric_version,
        token_usage: {
          input_tokens: 0, // Would need to track from Anthropic response
          output_tokens: 0,
          total_cost_usd: 0,
        },
        performance: {
          latency_ms: result.metadata.generation_time_ms,
          retries: 0,
          rate_limited: false,
        },
        quality_metrics: {
          json_parse_success: true,
          schema_validation_success: true,
          confidence_score: result.assessment.confidence.overall,
        },
      },
    })

    return NextResponse.json({
      success: true,
      applicationId,
      assessment: result.assessment,
      metadata: result.metadata,
      mode: 'live',
    })
  } catch (error) {
    console.error('Assessment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Fetch assessment for an application
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: applicationId } = await params

  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        applicationId,
        assessment: null,
        metadata: null,
        message: 'Demo mode - no assessment available',
      })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = createDb({ type: 'supabase-client', client: supabase })

    // Fetch application
    const { data: application, error } = await db.applications.getByIdWithFields(
      applicationId,
      'id, user_id, ai_assessment, ai_score, assessment_metadata'
    )

    if (error || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const { data: userProfile } = await db.users.getUserType(user.id)

    const isOwner = (application as any).user_id === user.id
    const isPartner = userProfile?.user_type === 'partner'

    if (!isOwner && !isPartner) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      applicationId,
      assessment: (application as any).ai_assessment,
      score: (application as any).ai_score,
      metadata: (application as any).assessment_metadata,
    })
  } catch (error) {
    console.error('Assessment GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
