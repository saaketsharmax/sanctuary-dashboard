// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Founder Requests Endpoint
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'

/**
 * GET /api/founder/requests
 * Get all requests for the founder's startup
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({
        success: true,
        requests: getEmptyRequests(),
        isMock: true,
      })
    }

    const db = createDb({ type: 'supabase-client', client: supabase })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: true,
        requests: getEmptyRequests(),
        isMock: true,
      })
    }

    // Get user's startup_id
    const { data: profile } = await db.users.getById(user.id)

    if (!profile?.startup_id) {
      return NextResponse.json({
        success: true,
        requests: getEmptyRequests(),
        isMock: true,
      })
    }

    // Get requests
    const { data: requests, error: requestsError } = await db.requests.getByStartupId(profile.startup_id)

    if (requestsError) {
      console.error('Requests fetch error:', requestsError)
      return NextResponse.json({
        success: true,
        requests: getEmptyRequests(),
        isMock: true,
      })
    }

    interface RequestRecord {
      id: string
      type: string
      title: string
      description: string | null
      status: string
      priority: string
      created_at: string
      updated_at: string
      resolution_notes: string | null
      resolved_at: string | null
      users?: { name: string } | null
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedRequests = (requests || []).map((req: any) => ({
      id: req.id,
      type: req.type,
      title: req.title,
      description: req.description,
      status: req.status,
      priority: req.priority,
      createdAt: req.created_at,
      updatedAt: req.updated_at,
      assignedTo: req.users?.name || null,
      resolutionNotes: req.resolution_notes,
      resolvedAt: req.resolved_at,
    }))

    return NextResponse.json({
      success: true,
      requests: formattedRequests,
      isMock: false,
    })
  } catch (error) {
    console.error('Founder requests API error:', error)
    return NextResponse.json({
      success: true,
      requests: getEmptyRequests(),
      isMock: true,
    })
  }
}

/**
 * POST /api/founder/requests
 * Create a new request
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const db = createDb({ type: 'supabase-client', client: supabase })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, description, priority } = body

    if (!type || !title) {
      return NextResponse.json({ error: 'Type and title are required' }, { status: 400 })
    }

    // Get user's startup_id
    const { data: profile } = await db.users.getById(user.id)

    if (!profile?.startup_id) {
      return NextResponse.json({ error: 'No startup found' }, { status: 404 })
    }

    // Create request
    const { data: newRequest, error: insertError } = await db.requests.create({
      startup_id: profile.startup_id,
      created_by: user.id,
      type,
      title,
      description: description || null,
      priority: priority || 'normal',
      status: 'pending',
    })

    if (insertError || !newRequest) {
      console.error('Insert request error:', insertError)
      return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      request: {
        id: newRequest.id,
        type: newRequest.type,
        title: newRequest.title,
        description: newRequest.description,
        status: newRequest.status,
        priority: newRequest.priority,
        createdAt: newRequest.created_at,
      },
    })
  } catch (error) {
    console.error('Create request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/founder/requests
 * Update a request (cancel only for founders)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const db = createDb({ type: 'supabase-client', client: supabase })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { requestId, action } = body

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID required' }, { status: 400 })
    }

    // Founders can only cancel their pending requests
    if (action !== 'cancel') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Verify request belongs to user and is pending
    const { data: existingRequest } = await db.requests.getByIdForOwner(requestId, user.id)

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (existingRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Can only cancel pending requests' }, { status: 400 })
    }

    // Update status
    const { data: updated, error: updateError } = await db.requests.update(requestId, { status: 'cancelled' })

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, request: updated })
  } catch (error) {
    console.error('Update request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getEmptyRequests() {
  return []
}
