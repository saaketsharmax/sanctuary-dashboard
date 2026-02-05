import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { z } from 'zod'

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
})

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
