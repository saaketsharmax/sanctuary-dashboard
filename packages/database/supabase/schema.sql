-- Sanctuary Dashboard Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- =============================================================================
-- USERS TABLE
-- Extends Supabase auth.users with application-specific fields
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('founder', 'partner')),
  partner_sub_type TEXT CHECK (partner_sub_type IN ('mentor', 'vc', 'startup_manager')),
  startup_id UUID,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own data (for initial profile creation)
CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (for re-running this script)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- UPDATED_AT TRIGGER
-- Automatically updates the updated_at timestamp
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON public.users;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- STARTUPS TABLE (for future use)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  stage TEXT CHECK (stage IN ('idea', 'mvp', 'seed', 'series_a', 'series_b', 'growth')),
  sector TEXT,
  website TEXT,
  founded_date DATE,
  team_size INTEGER,
  funding_raised DECIMAL(15, 2),
  mrr DECIMAL(15, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;

-- Partners can view all startups
CREATE POLICY "Partners can view startups" ON public.startups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- Founders can view their own startup
CREATE POLICY "Founders can view own startup" ON public.startups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND startup_id = startups.id
    )
  );

-- Founders can update their own startup
CREATE POLICY "Founders can update own startup" ON public.startups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND startup_id = startups.id
    )
  );

DROP TRIGGER IF EXISTS startups_updated_at ON public.startups;

CREATE TRIGGER startups_updated_at
  BEFORE UPDATE ON public.startups
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- Add foreign key constraint after startups table exists
-- =============================================================================

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_startup_id_fkey;

ALTER TABLE public.users
  ADD CONSTRAINT users_startup_id_fkey
  FOREIGN KEY (startup_id) REFERENCES public.startups(id) ON DELETE SET NULL;

-- =============================================================================
-- APPLICATIONS TABLE (for founder onboarding)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_description TEXT,
  founder_name TEXT NOT NULL,
  founder_email TEXT NOT NULL,
  founder_linkedin TEXT,
  stage TEXT,
  sector TEXT,
  team_size INTEGER,
  funding_status TEXT,
  problem_statement TEXT,
  solution TEXT,
  traction TEXT,
  interview_completed BOOLEAN DEFAULT FALSE,
  interview_score INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'interview', 'under_review', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON public.applications
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own applications
CREATE POLICY "Users can insert own applications" ON public.applications
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own applications
CREATE POLICY "Users can update own applications" ON public.applications
  FOR UPDATE USING (user_id = auth.uid());

-- Partners can view all applications
CREATE POLICY "Partners can view all applications" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- Partners can update application status
CREATE POLICY "Partners can update applications" ON public.applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

DROP TRIGGER IF EXISTS applications_updated_at ON public.applications;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_startup_id ON public.users(startup_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_startups_stage ON public.startups(stage);
