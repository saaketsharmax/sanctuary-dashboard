// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Partner Investment Transactions
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'

/**
 * GET /api/partner/investments/transactions
 * List pending (or all) requests across portfolio
 */
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = createDb({ type: 'supabase-client', client: supabase })

    const { data: profile } = await db.users.getUserType(user.id)

    if (profile?.user_type !== 'partner') {
      return NextResponse.json({ error: 'Only partners can view transactions' }, { status: 403 })
    }

    const url = new URL(request.url)
    const statusFilter = url.searchParams.get('status') // 'pending', 'approved', 'denied', or null for all

    const { data: transactions, error: txnError } = await db.investments.getAllTransactions(
      statusFilter ? { status: statusFilter } : undefined
    )

    if (txnError) {
      console.error('Transactions fetch error:', txnError)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    const formatted = (transactions || []).map((t: Record<string, unknown>) => {
      const inv = t.investments as { applications: { company_name: string } }
      const requester = t.requester as { name: string } | null
      const reviewer = t.reviewer as { name: string } | null

      return {
        id: t.id,
        investmentId: t.investment_id,
        type: t.type,
        creditCategory: t.credit_category,
        amountCents: t.amount_cents,
        title: t.title,
        description: t.description,
        status: t.status,
        requestedBy: t.requested_by,
        reviewedBy: t.reviewed_by,
        reviewedAt: t.reviewed_at,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        requesterName: requester?.name || null,
        reviewerName: reviewer?.name || null,
        companyName: inv?.applications?.company_name || 'Unknown',
      }
    })

    return NextResponse.json({
      success: true,
      transactions: formatted,
    })
  } catch (error) {
    console.error('Partner transactions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/partner/investments/transactions
 * Approve or deny a transaction request
 */
export async function PATCH(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = createDb({ type: 'supabase-client', client: supabase })

    const { data: profile } = await db.users.getUserType(user.id)

    if (profile?.user_type !== 'partner') {
      return NextResponse.json({ error: 'Only partners can update transactions' }, { status: 403 })
    }

    const body = await request.json()
    const { transactionId, action } = body

    if (!transactionId || !['approve', 'deny'].includes(action)) {
      return NextResponse.json({ error: 'transactionId and action (approve/deny) required' }, { status: 400 })
    }

    // Fetch the transaction with its parent investment for balance checks
    const { data: transaction } = await db.investments.getTransactionWithInvestment(transactionId)

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    if (transaction.status !== 'pending') {
      return NextResponse.json({ error: 'Transaction is not pending' }, { status: 400 })
    }

    // If approving, validate balance
    if (action === 'approve') {
      const { data: approvedTxns } = await db.investments.getApprovedTransactions(transaction.investment_id as string)

      const inv = transaction.investments as { cash_amount_cents: number; credits_amount_cents: number }

      if (transaction.type === 'cash_disbursement') {
        const usedCash = (approvedTxns || [])
          .filter((t) => t.type === 'cash_disbursement')
          .reduce((sum: number, t) => sum + (t.amount_cents as number), 0)

        const remaining = inv.cash_amount_cents - usedCash
        if ((transaction.amount_cents as number) > remaining) {
          return NextResponse.json({
            error: `Insufficient cash balance. Remaining: $${(remaining / 100).toLocaleString()}`,
          }, { status: 400 })
        }
      } else {
        const usedCredits = (approvedTxns || [])
          .filter((t) => t.type === 'credit_usage')
          .reduce((sum: number, t) => sum + (t.amount_cents as number), 0)

        const remaining = inv.credits_amount_cents - usedCredits
        if ((transaction.amount_cents as number) > remaining) {
          return NextResponse.json({
            error: `Insufficient credits balance. Remaining: $${(remaining / 100).toLocaleString()}`,
          }, { status: 400 })
        }
      }
    }

    const newStatus = action === 'approve' ? 'approved' : 'denied'

    const { data: updated, error: updateError } = await db.investments.updateTransaction(transactionId, {
      status: newStatus,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, transaction: updated })
  } catch (error) {
    console.error('Partner transaction update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
