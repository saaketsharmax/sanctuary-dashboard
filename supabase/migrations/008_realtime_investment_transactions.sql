-- Enable Supabase Realtime for investment_transactions
-- RLS policies from migration 007 ensure founders only see their own rows
-- and partners see all rows — the realtime channel inherits these.
ALTER PUBLICATION supabase_realtime ADD TABLE public.investment_transactions;
