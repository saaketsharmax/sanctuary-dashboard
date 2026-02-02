-- =====================================================
-- SANCTUARY DASHBOARD — Supabase Database Schema
-- Version: 1.0 (Bifurcated User Journey)
-- =====================================================
--
-- Run this SQL in your Supabase project's SQL Editor.
-- Dashboard: https://supabase.com/dashboard → SQL Editor
--
-- This schema sets up:
-- 1. Users table (extends auth.users)
-- 2. Row Level Security (RLS) policies
-- 3. Auto-create trigger for new signups
-- =====================================================

-- -----------------------------------------------------
-- USERS TABLE
-- Extends Supabase auth.users with application-specific fields
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
  -- Primary key links to Supabase Auth
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info (synced from auth on signup)
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,

  -- Role selection
  user_type TEXT CHECK (user_type IN ('founder', 'partner')),
  partner_sub_type TEXT CHECK (partner_sub_type IN ('mentor', 'vc', 'startup_manager')),

  -- Founder-specific
  startup_id UUID,  -- Will reference startups table when created
  onboarding_complete BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_startup_id ON public.users(startup_id);

-- -----------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own data
CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Allow insert during signup (trigger-based)
CREATE POLICY "Enable insert for authenticated users only"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Partners (startup_manager) can view all users
-- This allows them to see founder data for portfolio management
CREATE POLICY "Startup managers can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.user_type = 'partner'
      AND u.partner_sub_type = 'startup_manager'
    )
  );

-- -----------------------------------------------------
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- -----------------------------------------------------

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Run handle_new_user() after auth.users INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------
-- AUTO-UPDATE TIMESTAMP
-- -----------------------------------------------------

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update updated_at on users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- -----------------------------------------------------
-- HELPER FUNCTION: Get user with type info
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_user_with_role(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  user_type TEXT,
  partner_sub_type TEXT,
  startup_id UUID,
  onboarding_complete BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.name,
    u.avatar_url,
    u.user_type,
    u.partner_sub_type,
    u.startup_id,
    u.onboarding_complete,
    u.created_at
  FROM public.users u
  WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------
-- GRANT PERMISSIONS
-- -----------------------------------------------------

-- Allow authenticated users to use the function
GRANT EXECUTE ON FUNCTION public.get_user_with_role(UUID) TO authenticated;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions (with RLS, these are filtered)
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- =====================================================
-- POST-SETUP VERIFICATION
-- =====================================================
--
-- After running this script, verify in Supabase Dashboard:
--
-- 1. Table Editor → users table exists with correct columns
-- 2. Authentication → Policies → users table has 4 policies
-- 3. SQL Editor → Run: SELECT * FROM public.users; (should be empty)
--
-- Test by signing up a new user - they should appear in public.users
-- =====================================================
