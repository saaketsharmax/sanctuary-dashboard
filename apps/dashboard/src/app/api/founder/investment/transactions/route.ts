// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Founder Investment Transactions
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'

const VALID_TYPES = ['cash_disbursement', 'credit_usage'] as const
const VALID_CATEGORIES = ['space', 'design', 'gtm', 'launch_media'] as const

/**
 * POST /api/founder/investment/transactions
 * Create a new fund/credit request
 */
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { investmentId, type, creditCategory, amountCents, title, description } = body

    // Validate required fields
    if (!investmentId || !type || !amountCents || !title) {
      return NextResponse.json({ error: 'Missing required fields: investmentId, type, amountCents, title' }, { status: 400 })
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (type === 'credit_usage' && (!creditCategory || !VALID_CATEGORIES.includes(creditCategory))) {
      return NextResponse.json({ error: 'Credit category required for credit_usage' }, { status: 400 })
    }

    if (amountCents <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 })
    }

    // Verify investment belongs to this founder
    const { data: investment } = await supabase
      .from('investments')
      .select('id, cash_amount_cents, credits_amount_cents, status, application_id')
      .eq('id', investmentId)
      .single()

    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 })
    }

    if (investment.status !== 'active') {
      return NextResponse.json({ error: 'Investment is not active' }, { status: 400 })
    }

    // Verify founder owns this investment (via application)
    const { data: application } = await supabase
      .from('applications')
      .select('user_id')
      .eq('id', investment.application_id)
      .single()

    if (!application || application.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check balance: get sum of approved transactions
    const { data: approvedTxns } = await supabase
      .from('investment_transactions')
      .select('type, amount_cents')
      .eq('investment_id', investmentId)
      .eq('status', 'approved')

    const usedCash = (approvedTxns || [])
      .filter((t: { type: string }) => t.type === 'cash_disbursement')
      .reduce((sum: number, t: { amount_cents: number }) => sum + t.amount_cents, 0)

    const usedCredits = (approvedTxns || [])
      .filter((t: { type: string }) => t.type === 'credit_usage')
      .reduce((sum: number, t: { amount_cents: number }) => sum + t.amount_cents, 0)

    if (type === 'cash_disbursement') {
      const remaining = investment.cash_amount_cents - usedCash
      if (amountCents > remaining) {
        return NextResponse.json({ error: `Insufficient cash balance. Remaining: $${(remaining / 100).toLocaleString()}` }, { status: 400 })
      }
    } else {
      const remaining = investment.credits_amount_cents - usedCredits
      if (amountCents > remaining) {
        return NextResponse.json({ error: `Insufficient credits balance. Remaining: $${(remaining / 100).toLocaleString()}` }, { status: 400 })
      }
    }

    // Create the transaction
    const { data: transaction, error: insertError } = await supabase
      .from('investment_transactions')
      .insert({
        investment_id: investmentId,
        type,
        credit_category: type === 'credit_usage' ? creditCategory : null,
        amount_cents: amountCents,
        title,
        description: description || null,
        status: 'pending',
        requested_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert transaction error:', insertError)
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        investmentId: transaction.investment_id,
        type: transaction.type,
        creditCategory: transaction.credit_category,
        amountCents: transaction.amount_cents,
        title: transaction.title,
        description: transaction.description,
        status: transaction.status,
        requestedBy: transaction.requested_by,
        createdAt: transaction.created_at,
      },
    })
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/founder/investment/transactions
 * Cancel own pending request
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

    const body = await request.json()
    const { transactionId, action } = body

    if (!transactionId || action !== 'cancel') {
      return NextResponse.json({ error: 'transactionId and action=cancel required' }, { status: 400 })
    }

    // Verify transaction belongs to user and is pending
    const { data: transaction } = await supabase
      .from('investment_transactions')
      .select('id, status, requested_by')
      .eq('id', transactionId)
      .eq('requested_by', user.id)
      .single()

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    if (transaction.status !== 'pending') {
      return NextResponse.json({ error: 'Can only cancel pending transactions' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await supabase
      .from('investment_transactions')
      .update({ status: 'cancelled' })
      .eq('id', transactionId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, transaction: updated })
  } catch (error) {
    console.error('Cancel transaction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
