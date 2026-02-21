-- ═══════════════════════════════════════════════════════════════════════════
-- SANCTUARY OS — Investment & Credits Schema
-- Migration 007: Investments, Investment Transactions
-- ═══════════════════════════════════════════════════════════════════════════

-- INVESTMENTS TABLE
-- One record per approved startup: $50k cash + $50k service credits
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  startup_id UUID REFERENCES public.startups(id) ON DELETE SET NULL,
  cash_amount_cents BIGINT NOT NULL DEFAULT 5000000,    -- $50,000
  credits_amount_cents BIGINT NOT NULL DEFAULT 5000000, -- $50,000
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_investment_per_application UNIQUE (application_id)
);

CREATE INDEX IF NOT EXISTS idx_investments_application ON public.investments(application_id);
CREATE INDEX IF NOT EXISTS idx_investments_startup ON public.investments(startup_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON public.investments(status);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Founders: SELECT own investment (via applications.user_id = auth.uid())
CREATE POLICY "Founders can view own investment" ON public.investments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = investments.application_id
        AND applications.user_id = auth.uid()
    )
  );

-- Partners: SELECT all investments
CREATE POLICY "Partners can view all investments" ON public.investments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- System can insert (used by admin client on approval)
CREATE POLICY "System can insert investments" ON public.investments
  FOR INSERT WITH CHECK (true);

-- System can update investments
CREATE POLICY "System can update investments" ON public.investments
  FOR UPDATE USING (true);

-- INVESTMENT TRANSACTIONS TABLE
-- Every cash disbursement or credit usage request
CREATE TABLE IF NOT EXISTS public.investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cash_disbursement', 'credit_usage')),
  credit_category TEXT CHECK (
    credit_category IS NULL OR credit_category IN ('space', 'design', 'gtm', 'launch_media')
  ),
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  requested_by UUID NOT NULL REFERENCES public.users(id),
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- credit_category required for credit_usage transactions
  CONSTRAINT credit_category_required CHECK (
    type != 'credit_usage' OR credit_category IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_investment_transactions_investment ON public.investment_transactions(investment_id);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_status ON public.investment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_type ON public.investment_transactions(type);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_requested_by ON public.investment_transactions(requested_by);

ALTER TABLE public.investment_transactions ENABLE ROW LEVEL SECURITY;

-- Founders: SELECT own transactions (via investment → application → user_id)
CREATE POLICY "Founders can view own transactions" ON public.investment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.investments
      JOIN public.applications ON applications.id = investments.application_id
      WHERE investments.id = investment_transactions.investment_id
        AND applications.user_id = auth.uid()
    )
  );

-- Founders: INSERT transactions on own investment
CREATE POLICY "Founders can create transactions" ON public.investment_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.investments
      JOIN public.applications ON applications.id = investments.application_id
      WHERE investments.id = investment_transactions.investment_id
        AND applications.user_id = auth.uid()
    )
  );

-- Founders: UPDATE own pending transactions (for cancellation)
CREATE POLICY "Founders can update own pending transactions" ON public.investment_transactions
  FOR UPDATE USING (
    requested_by = auth.uid()
    AND status = 'pending'
  );

-- Partners: SELECT all transactions
CREATE POLICY "Partners can view all transactions" ON public.investment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- Partners: UPDATE transactions (approve/deny)
CREATE POLICY "Partners can update transactions" ON public.investment_transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- System can insert (for auto-allocation or admin actions)
CREATE POLICY "System can insert transactions" ON public.investment_transactions
  FOR INSERT WITH CHECK (true);

-- UPDATE TRIGGERS
DROP TRIGGER IF EXISTS update_investments_updated_at ON public.investments;
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_investment_transactions_updated_at ON public.investment_transactions;
CREATE TRIGGER update_investment_transactions_updated_at BEFORE UPDATE ON public.investment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
