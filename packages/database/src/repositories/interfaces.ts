// Repository interfaces — provider-agnostic data access layer
// Each repository groups methods by domain aggregate

// Common result type matching Supabase convention
export interface DbResult<T> {
  data: T | null
  error: Error | null
}

export interface DbListResult<T> {
  data: T[]
  error: Error | null
}

// -------------------------------------------------------
// IUserRepository
// -------------------------------------------------------
export interface IUserRepository {
  getById(id: string): Promise<DbResult<Record<string, any>>>
  getByField(field: string, value: string): Promise<DbResult<Record<string, any>>>
  update(id: string, data: Record<string, any>): Promise<DbResult<Record<string, any>>>
  getUserType(id: string): Promise<DbResult<{ user_type: string | null }>>
  getPartners(subTypes?: string[]): Promise<DbListResult<Record<string, any>>>
}

// -------------------------------------------------------
// IApplicationRepository
// -------------------------------------------------------
export interface IApplicationRepository {
  create(data: Record<string, any>): Promise<DbResult<Record<string, any>>>
  getById(id: string): Promise<DbResult<Record<string, any>>>
  getByIdWithFields(id: string, fields: string): Promise<DbResult<Record<string, any>>>
  getByUserId(userId: string): Promise<DbListResult<Record<string, any>>>
  getAll(fields?: string): Promise<DbListResult<Record<string, any>>>
  getAllFiltered(filters: {
    reviewDecisionNotNull?: boolean
    reviewedAtGte?: string
  }, fields?: string): Promise<DbListResult<Record<string, any>>>
  update(id: string, data: Record<string, any>): Promise<DbResult<Record<string, any>>>
  updateAndReturn(id: string, data: Record<string, any>): Promise<DbResult<Record<string, any>>>

  // Interview signals
  insertSignals(signals: Record<string, any>[]): Promise<DbResult<null>>
  getSignals(applicationId: string): Promise<DbListResult<Record<string, any>>>
  getSignalsFiltered(filters: { createdAtGte?: string }): Promise<DbListResult<Record<string, any>>>

  // Assessment feedback
  insertFeedback(data: Record<string, any>): Promise<DbResult<Record<string, any>>>
  getFeedback(applicationId: string): Promise<DbListResult<Record<string, any>>>
  getAllFeedback(): Promise<DbListResult<Record<string, any>>>
  getAllFeedbackFiltered(filters: { createdAtGte?: string }): Promise<DbListResult<Record<string, any>>>

  // Founders (separate table linked by application_id)
  getFounders(applicationId: string): Promise<DbListResult<Record<string, any>>>
}

// -------------------------------------------------------
// IDDRepository
// -------------------------------------------------------
export interface IDDRepository {
  // Claims
  insertClaims(claims: Record<string, any>[]): Promise<DbListResult<Record<string, any>>>
  getClaims(applicationId: string, filters?: {
    category?: string
    status?: string
    priority?: string
  }): Promise<DbListResult<Record<string, any>>>
  getClaimsFiltered(filters: { createdAtGte?: string }): Promise<DbListResult<Record<string, any>>>
  getClaimCount(applicationId: string): Promise<{ count: number; error: Error | null }>
  deleteClaims(applicationId: string): Promise<{ error: Error | null }>
  updateClaim(claimId: string, data: Record<string, any>): Promise<{ error: Error | null }>

  // Verifications
  insertVerifications(verifications: Record<string, any>[]): Promise<{ error: Error | null }>
  getVerifications(claimIds: string[]): Promise<DbListResult<Record<string, any>>>
  deleteVerifications(claimIds: string[]): Promise<{ error: Error | null }>

  // Reports
  insertReport(report: Record<string, any>): Promise<DbResult<{ id: string }>>
  getReport(reportId: string): Promise<DbResult<Record<string, any>>>
  getReportByApplicationId(applicationId: string): Promise<DbResult<Record<string, any>>>
  getLatestReportData(applicationId: string): Promise<DbResult<{ report_data: any }>>
  updateLatestReport(applicationId: string, data: Record<string, any>): Promise<{ error: Error | null }>
  deleteReports(applicationId: string): Promise<{ error: Error | null }>

  // Agent runs
  logAgentRun(data: Record<string, any>): Promise<DbResult<Record<string, any>>>
  updateAgentRun(id: string, data: Record<string, any>): Promise<{ error: Error | null }>
  getLatestAgentRun(agentType: string): Promise<DbResult<Record<string, any>>>
}

// -------------------------------------------------------
// IStartupRepository
// -------------------------------------------------------
export interface IStartupRepository {
  getById(id: string): Promise<DbResult<Record<string, any>>>
  getByIdWithCohort(id: string): Promise<DbResult<Record<string, any>>>
  getByApplicationId(applicationId: string): Promise<DbResult<Record<string, any>>>
  create(data: Record<string, any>): Promise<DbResult<Record<string, any>>>
  update(id: string, data: Record<string, any>): Promise<DbResult<Record<string, any>>>

  // Metrics
  getLatestMetrics(startupId: string): Promise<DbResult<Record<string, any>>>
  getMetricsHistory(startupId: string, since: string, fields?: string): Promise<DbListResult<Record<string, any>>>
  getMetricsSeries(startupId: string, limit: number): Promise<DbListResult<Record<string, any>>>
  getAllRecentMetrics(limit: number): Promise<DbListResult<Record<string, any>>>

  // Shared metrics config
  getSharedMetrics(startupId: string): Promise<DbListResult<Record<string, any>>>

  // Checkpoints
  getCheckpoints(startupId: string): Promise<DbListResult<Record<string, any>>>
  getCheckpointById(id: string, startupId: string): Promise<DbResult<Record<string, any>>>
  updateCheckpoint(id: string, data: Record<string, any>): Promise<DbResult<Record<string, any>>>

  // Partner feedback
  getPartnerFeedback(startupId: string, options?: { visibleToFounder?: boolean; limit?: number }): Promise<DbListResult<Record<string, any>>>
}

// -------------------------------------------------------
// IInvestmentRepository
// -------------------------------------------------------
export interface IInvestmentRepository {
  create(data: Record<string, any>): Promise<{ error: Error | null }>
  getById(id: string, fields?: string): Promise<DbResult<Record<string, any>>>
  getByApplicationId(applicationId: string): Promise<DbResult<Record<string, any>>>
  getAllWithCompanyName(): Promise<DbListResult<Record<string, any>>>
  getByIdWithCompanyName(id: string): Promise<DbResult<Record<string, any>>>

  // Transactions
  createTransaction(data: Record<string, any>): Promise<DbResult<Record<string, any>>>
  getTransactions(investmentId: string): Promise<DbListResult<Record<string, any>>>
  getTransactionsWithNames(investmentId: string): Promise<DbListResult<Record<string, any>>>
  getTransactionsBatch(investmentIds: string[]): Promise<DbListResult<Record<string, any>>>
  getTransactionById(id: string): Promise<DbResult<Record<string, any>>>
  getTransactionByIdForOwner(id: string, userId: string): Promise<DbResult<Record<string, any>>>
  getTransactionWithInvestment(id: string): Promise<DbResult<Record<string, any>>>
  getApprovedTransactions(investmentId: string): Promise<DbListResult<Record<string, any>>>
  updateTransaction(id: string, data: Record<string, any>): Promise<DbResult<Record<string, any>>>
  getAllTransactions(filters?: { status?: string }): Promise<DbListResult<Record<string, any>>>
  getAllTransactionsWithDetails(filters?: { status?: string }): Promise<DbListResult<Record<string, any>>>
}

// -------------------------------------------------------
// IDocumentRepository
// -------------------------------------------------------
export interface IDocumentRepository {
  getByStartupId(startupId: string, options?: { currentOnly?: boolean; fields?: string }): Promise<DbListResult<Record<string, any>>>
  create(data: Record<string, any>): Promise<DbResult<Record<string, any>>>
  getById(id: string, startupId: string): Promise<DbResult<Record<string, any>>>
  delete(id: string): Promise<{ error: Error | null }>
  markNotCurrent(startupId: string, docName: string, docType: string): Promise<{ error: Error | null }>
  getMaxVersion(startupId: string, docName: string): Promise<DbResult<{ version: number }>>
}

// -------------------------------------------------------
// IMentorRepository
// -------------------------------------------------------
export interface IMentorRepository {
  getCandidates(): Promise<DbListResult<Record<string, any>>>
  getMatches(startupId: string): Promise<DbListResult<Record<string, any>>>
  getHistoricalMatches(statuses?: string[]): Promise<DbListResult<Record<string, any>>>
}

// -------------------------------------------------------
// IRequestRepository
// -------------------------------------------------------
export interface IRequestRepository {
  getByStartupId(startupId: string): Promise<DbListResult<Record<string, any>>>
  create(data: Record<string, any>): Promise<DbResult<Record<string, any>>>
  getByIdForOwner(id: string, userId: string): Promise<DbResult<Record<string, any>>>
  update(id: string, data: Record<string, any>): Promise<DbResult<Record<string, any>>>
}
