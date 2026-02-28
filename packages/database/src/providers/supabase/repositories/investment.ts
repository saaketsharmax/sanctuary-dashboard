import type { SupabaseClient } from '@supabase/supabase-js'
import type { IInvestmentRepository, DbResult, DbListResult } from '../../../repositories/interfaces'

export class SupabaseInvestmentRepository implements IInvestmentRepository {
  constructor(private client: SupabaseClient) {}

  async create(data: Record<string, any>): Promise<{ error: Error | null }> {
    const { error } = await this.client
      .from('investments')
      .insert(data)
    return { error }
  }

  async getById(id: string, fields?: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('investments')
      .select(fields ?? '*')
      .eq('id', id)
      .single()
    return { data, error }
  }

  async getByApplicationId(applicationId: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('investments')
      .select('*')
      .eq('application_id', applicationId)
      .single()
    return { data, error }
  }

  async getAllWithCompanyName(): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('investments')
      .select('*, applications!inner(company_name)')
      .order('created_at', { ascending: false })
    return { data: data || [], error }
  }

  async getByIdWithCompanyName(id: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('investments')
      .select('*, applications!inner(company_name)')
      .eq('id', id)
      .single()
    return { data, error }
  }

  // Transactions

  async createTransaction(data: Record<string, any>): Promise<DbResult<Record<string, any>>> {
    const { data: result, error } = await this.client
      .from('investment_transactions')
      .insert(data)
      .select()
      .single()
    return { data: result, error }
  }

  async getTransactions(investmentId: string): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('investment_transactions')
      .select('*')
      .eq('investment_id', investmentId)
    return { data: data || [], error }
  }

  async getTransactionsWithNames(investmentId: string): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('investment_transactions')
      .select(`
        *,
        requester:users!investment_transactions_requested_by_fkey(name),
        reviewer:users!investment_transactions_reviewed_by_fkey(name)
      `)
      .eq('investment_id', investmentId)
      .order('created_at', { ascending: false })
    return { data: data || [], error }
  }

  async getTransactionsBatch(investmentIds: string[]): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('investment_transactions')
      .select('*')
      .in('investment_id', investmentIds)
    return { data: data || [], error }
  }

  async getTransactionById(id: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('investment_transactions')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  }

  async getTransactionByIdForOwner(id: string, userId: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('investment_transactions')
      .select('*')
      .eq('id', id)
      .eq('requested_by', userId)
      .single()
    return { data, error }
  }

  async getTransactionWithInvestment(id: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('investment_transactions')
      .select('*, investments!inner(cash_amount_cents, credits_amount_cents)')
      .eq('id', id)
      .single()
    return { data, error }
  }

  async getApprovedTransactions(investmentId: string): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('investment_transactions')
      .select('*')
      .eq('investment_id', investmentId)
      .eq('status', 'approved')
    return { data: data || [], error }
  }

  async updateTransaction(id: string, data: Record<string, any>): Promise<DbResult<Record<string, any>>> {
    const { data: result, error } = await this.client
      .from('investment_transactions')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    return { data: result, error }
  }

  async getAllTransactions(filters?: { status?: string }): Promise<DbListResult<Record<string, any>>> {
    let query = this.client
      .from('investment_transactions')
      .select('*, investments!inner(application_id, applications!inner(company_name)), requester:users!investment_transactions_requested_by_fkey(name), reviewer:users!investment_transactions_reviewed_by_fkey(name)')
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    const { data, error } = await query
    return { data: data || [], error }
  }

  async getAllTransactionsWithDetails(filters?: { status?: string }): Promise<DbListResult<Record<string, any>>> {
    let query = this.client
      .from('investment_transactions')
      .select('*, investments!inner(application_id, applications!inner(company_name)), requester:users!investment_transactions_requested_by_fkey(name), reviewer:users!investment_transactions_reviewed_by_fkey(name)')
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    const { data, error } = await query
    return { data: data || [], error }
  }
}
