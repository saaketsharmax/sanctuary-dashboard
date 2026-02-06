import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { getAssessmentAgent, type AssessmentInput } from '@/lib/ai/agents/assessment-agent'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Generate assessment for an application
export async function POST(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now()
  const { id: applicationId } = await params

  try {
    // If Supabase is not configured, use mock data
    if (!isSupabaseConfigured()) {
      console.log(`Demo mode: Generating mock assessment for application ${applicationId}`)

      const agent = getAssessmentAgent()
      const mockInput: AssessmentInput = {
        applicationId,
        companyName: 'Demo Company',
        applicationData: {
          companyOneLiner: 'A demo company for testing',
          problemDescription: 'Demo problem description',
          targetCustomer: 'Demo target customer',
          solutionDescription: 'Demo solution',
          stage: 'mvp',
          userCount: 10,
          mrr: 1000,
          biggestChallenge: 'Demo challenge',
          whySanctuary: 'Demo reason',
          whatTheyWant: 'Demo wants',
          founders: [
            { name: 'Demo Founder', isLead: true, hasStartedBefore: true, yearsExperience: 5 }
          ],
        },
        transcript: [
          { role: 'assistant', content: 'Welcome to your interview.', section: 'founder_dna' },
          { role: 'user', content: 'Thank you for having me.', section: 'founder_dna' },
        ],
        signals: [],
      }

      const result = await agent.generateAssessment(mockInput)

      return NextResponse.json({
        success: result.success,
        applicationId,
        assessment: result.assessment,
        metadata: result.metadata,
        mode: 'demo',
      })
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

    // Check if user is a partner
    const { data: userProfile } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (userProfile?.user_type !== 'partner') {
      return NextResponse.json(
        { error: 'Only partners can trigger assessments' },
        { status: 403 }
      )
    }

    // Fetch the application with all data
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check if interview is completed
    if (!application.interview_transcript || application.interview_transcript.length === 0) {
      return NextResponse.json(
        { error: 'Interview must be completed before assessment' },
        { status: 400 }
      )
    }

    // Fetch signals if available
    const { data: signals } = await supabase
      .from('interview_signals')
      .select('*')
      .eq('application_id', applicationId)

    // Build assessment input
    const assessmentInput: AssessmentInput = {
      applicationId,
      companyName: application.company_name,
      applicationData: {
        companyOneLiner: application.company_one_liner,
        companyDescription: application.company_description,
        problemDescription: application.problem_description,
        targetCustomer: application.target_customer,
        solutionDescription: application.solution_description,
        stage: application.stage,
        userCount: application.user_count,
        mrr: application.mrr,
        biggestChallenge: application.biggest_challenge,
        whySanctuary: application.why_sanctuary,
        whatTheyWant: application.what_they_want,
        founders: application.founders || [],
      },
      transcript: application.interview_transcript,
      signals: signals?.map((s: { signal_type: string; content: string; dimension: string; impact_score: number }) => ({
        type: s.signal_type,
        content: s.content,
        dimension: s.dimension,
        impact: s.impact_score,
      })) || [],
    }

    // Generate assessment
    const agent = getAssessmentAgent()
    const result = await agent.generateAssessment(assessmentInput)

    if (!result.success || !result.assessment) {
      // Log the agent run as failed
      await supabase.from('agent_runs').insert({
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
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        ai_assessment: aiAssessment,
        ai_score: result.assessment.overallScore / 100, // Store as 0-1 decimal
        assessment_metadata: result.metadata,
      })
      .eq('id', applicationId)

    if (updateError) {
      console.error('Failed to save assessment:', updateError)
      return NextResponse.json(
        { error: 'Failed to save assessment', details: updateError.message },
        { status: 500 }
      )
    }

    // Log successful agent run
    await supabase.from('agent_runs').insert({
      agent_type: 'assessment',
      agent_version: 'v1.0',
      application_id: applicationId,
      triggered_by: user.id,
      trigger_type: 'manual',
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      status: 'completed',
      input_summary: {
        company_name: application.company_name,
        transcript_length: application.interview_transcript.length,
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

    // Fetch application
    const { data: application, error } = await supabase
      .from('applications')
      .select('id, user_id, ai_assessment, ai_score, assessment_metadata')
      .eq('id', applicationId)
      .single()

    if (error || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const { data: userProfile } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    const isOwner = application.user_id === user.id
    const isPartner = userProfile?.user_type === 'partner'

    if (!isOwner && !isPartner) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      applicationId,
      assessment: application.ai_assessment,
      score: application.ai_score,
      metadata: application.assessment_metadata,
    })
  } catch (error) {
    console.error('Assessment GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
