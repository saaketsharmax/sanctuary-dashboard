import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { z } from 'zod'
import type { ApplicationMetadata } from '@/types/metadata'

// Validation schema matching the form
const founderSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.string().optional(),
  isLead: z.boolean(),
  linkedin: z.string().optional(),
  yearsExperience: z.number().optional(),
  hasStartedBefore: z.boolean(),
})

// Metadata schema for form behavior tracking
const formBehaviorSchema = z.object({
  started_at: z.string(),
  completed_at: z.string(),
  total_time_seconds: z.number(),
  time_per_step: z.object({
    company: z.number(),
    founders: z.number(),
    problem: z.number(),
    solution: z.number(),
    traction: z.number(),
    fit: z.number(),
  }),
  steps_revisited: z.array(z.string()),
  fields_edited_after_initial: z.array(z.string()),
  device_type: z.enum(['desktop', 'mobile', 'tablet']),
  browser: z.string(),
}).optional()

const applicationSchema = z.object({
  companyName: z.string().min(2),
  companyOneLiner: z.string().min(10),
  companyWebsite: z.string().optional(),
  companyDescription: z.string().optional(),
  founders: z.array(founderSchema).min(1),
  problemDescription: z.string().min(20),
  targetCustomer: z.string().min(10),
  solutionDescription: z.string().min(20),
  stage: z.string().min(1),
  userCount: z.number().optional(),
  mrr: z.number().optional(),
  biggestChallenge: z.string().min(10),
  whySanctuary: z.string().min(20),
  whatTheyWant: z.string().min(20),
  // Metadata from form tracking
  formBehavior: formBehaviorSchema,
  source: z.object({
    referral_code: z.string().nullable().optional(),
    utm_source: z.string().nullable().optional(),
    utm_campaign: z.string().nullable().optional(),
    utm_medium: z.string().nullable().optional(),
    landing_page: z.string().optional(),
  }).optional(),
})

// Helper function to analyze content quality
function analyzeContent(data: z.infer<typeof applicationSchema>): ApplicationMetadata['content_analysis'] {
  const textFields = {
    problemDescription: data.problemDescription,
    solutionDescription: data.solutionDescription,
    targetCustomer: data.targetCustomer,
    biggestChallenge: data.biggestChallenge,
    whySanctuary: data.whySanctuary,
    whatTheyWant: data.whatTheyWant,
    companyDescription: data.companyDescription || '',
  }

  // Calculate word counts
  const wordCounts: Record<string, number> = {}
  let totalWords = 0
  for (const [key, value] of Object.entries(textFields)) {
    const words = value.split(/\s+/).filter(w => w.length > 0).length
    wordCounts[key] = words
    totalWords += words
  }

  // Extract metrics mentioned (numbers with context)
  const allText = Object.values(textFields).join(' ')
  const metricsRegex = /\$?\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:k|K|m|M|%|users?|customers?|MRR|ARR|calls?|interviews?))?/g
  const metricsFound = allText.match(metricsRegex) || []

  // Extract named entities (capitalized words that look like company names)
  const entityRegex = /\b[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\b/g
  const potentialEntities = allText.match(entityRegex) || []
  const commonWords = new Set(['I', 'We', 'Our', 'The', 'This', 'That', 'They', 'Their', 'What', 'How', 'Why', 'When', 'Where'])
  const entities = [...new Set(potentialEntities.filter(e => !commonWords.has(e) && e.length > 2))]

  // Calculate buzzword density
  const buzzwords = ['AI', 'ML', 'blockchain', 'disrupt', 'revolutionary', 'game-changing', 'synergy', 'leverage', 'paradigm', 'innovative', 'cutting-edge', 'world-class', 'best-in-class', 'scalable']
  const buzzwordCount = buzzwords.reduce((count, word) => {
    const regex = new RegExp(word, 'gi')
    return count + (allText.match(regex) || []).length
  }, 0)
  const buzzwordDensity = totalWords > 0 ? buzzwordCount / totalWords : 0

  // Calculate specificity score (presence of numbers, specific examples)
  const hasNumbers = /\d+/.test(allText)
  const hasSpecificExamples = /for example|such as|specifically|e\.g\.|i\.e\./i.test(allText)
  const hasQuotes = /"[^"]+"|'[^']+'/.test(allText)
  const specificityScore = (hasNumbers ? 0.4 : 0) + (hasSpecificExamples ? 0.3 : 0) + (hasQuotes ? 0.3 : 0)

  return {
    total_word_count: totalWords,
    avg_answer_length: wordCounts,
    readability_score: Math.min(100, Math.round(totalWords / 10)), // Simple proxy
    specificity_score: specificityScore,
    buzzword_density: Math.round(buzzwordDensity * 1000) / 1000,
    metrics_mentioned: metricsFound.slice(0, 10), // Limit to 10
    named_entities: entities.slice(0, 15), // Limit to 15
  }
}

// Helper function to detect red/green flags in application
function detectFlags(data: z.infer<typeof applicationSchema>) {
  const redFlags: ApplicationMetadata['red_flags_detected'] = []
  const greenFlags: ApplicationMetadata['green_flags_detected'] = []

  // Check for red flags
  if (data.userCount === 0 && data.mrr && data.mrr > 0) {
    redFlags.push({
      type: 'inconsistency',
      description: 'Has MRR but reports 0 users',
      severity: 'medium',
    })
  }

  if (data.problemDescription.length < 100) {
    redFlags.push({
      type: 'shallow_response',
      description: 'Problem description is very brief',
      severity: 'low',
    })
  }

  // Check for green flags
  const hasExperience = data.founders.some(f => (f.yearsExperience || 0) > 5)
  if (hasExperience) {
    greenFlags.push({
      type: 'experience',
      description: 'Founder has 5+ years relevant experience',
      confidence: 0.8,
    })
  }

  const hasRepeatFounder = data.founders.some(f => f.hasStartedBefore)
  if (hasRepeatFounder) {
    greenFlags.push({
      type: 'repeat_founder',
      description: 'Team includes repeat founder',
      confidence: 0.9,
    })
  }

  if (data.mrr && data.mrr > 1000) {
    greenFlags.push({
      type: 'revenue',
      description: 'Already generating $1k+ MRR',
      confidence: 0.95,
    })
  }

  if (data.userCount && data.userCount > 10) {
    greenFlags.push({
      type: 'traction',
      description: 'Has 10+ users',
      confidence: 0.85,
    })
  }

  return { redFlags, greenFlags }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validationResult = applicationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // If Supabase is not configured, return a demo application ID
    if (!isSupabaseConfigured()) {
      const demoId = `demo-app-${Date.now()}`
      console.log('Demo mode: Application data:', data)
      return NextResponse.json({
        id: demoId,
        message: 'Application saved (demo mode)',
      })
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Require authentication when Supabase is configured
    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to submit an application' },
        { status: 401 }
      )
    }

    // Analyze content and detect flags
    const contentAnalysis = analyzeContent(data)
    const { redFlags, greenFlags } = detectFlags(data)

    // Build application metadata
    const applicationMetadata: ApplicationMetadata = {
      source: {
        referral_code: data.source?.referral_code || null,
        referrer_id: null,
        utm_source: data.source?.utm_source || null,
        utm_campaign: data.source?.utm_campaign || null,
        utm_medium: data.source?.utm_medium || null,
        landing_page: data.source?.landing_page || '',
      },
      form_behavior: data.formBehavior ? {
        started_at: data.formBehavior.started_at,
        completed_at: data.formBehavior.completed_at,
        total_time_seconds: data.formBehavior.total_time_seconds,
        time_per_step: data.formBehavior.time_per_step,
        steps_revisited: data.formBehavior.steps_revisited,
        fields_edited_after_initial: data.formBehavior.fields_edited_after_initial,
        save_and_resume_count: 0,
        device_type: data.formBehavior.device_type,
        browser: data.formBehavior.browser,
      } : {
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        total_time_seconds: 0,
        time_per_step: { company: 0, founders: 0, problem: 0, solution: 0, traction: 0, fit: 0 },
        steps_revisited: [],
        fields_edited_after_initial: [],
        save_and_resume_count: 0,
        device_type: 'desktop',
        browser: 'unknown',
      },
      content_analysis: contentAnalysis,
      red_flags_detected: redFlags,
      green_flags_detected: greenFlags,
    }

    // Transform camelCase to snake_case for database
    const applicationData = {
      user_id: user?.id || null,
      status: 'submitted',
      company_name: data.companyName,
      company_one_liner: data.companyOneLiner,
      company_website: data.companyWebsite || null,
      company_description: data.companyDescription || null,
      problem_description: data.problemDescription,
      target_customer: data.targetCustomer,
      solution_description: data.solutionDescription,
      stage: data.stage,
      user_count: data.userCount || 0,
      mrr: data.mrr || 0,
      biggest_challenge: data.biggestChallenge,
      why_sanctuary: data.whySanctuary,
      what_they_want: data.whatTheyWant,
      founders: data.founders,
      submitted_at: new Date().toISOString(),
      application_metadata: applicationMetadata,
    }

    // Insert into database
    const { data: application, error } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save application', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: application.id,
      message: 'Application submitted successfully',
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET handler to fetch user's applications
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ applications: [] })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: applications, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
