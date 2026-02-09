-- SANCTUARY OS - Complete Database Schema

-- Drop tables first (this cascades to triggers)
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.metrics CASCADE;
DROP TABLE IF EXISTS public.checkpoints CASCADE;
DROP TABLE IF EXISTS public.mentor_matches CASCADE;
DROP TABLE IF EXISTS public.mentors CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.startups CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at();

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE public.users (
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

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create user profile on signup
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STARTUPS TABLE
CREATE TABLE public.startups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  one_liner TEXT,
  description TEXT,
  website TEXT,
  stage TEXT CHECK (stage IN ('idea', 'prototype', 'mvp', 'early_revenue', 'growth')),
  industry TEXT,
  founded_date DATE,
  logo_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'interviewing', 'accepted', 'rejected', 'active', 'graduated', 'inactive')),
  cohort_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.users
  ADD CONSTRAINT fk_users_startup
  FOREIGN KEY (startup_id) REFERENCES public.startups(id);

-- APPLICATIONS TABLE
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id UUID REFERENCES public.startups(id),
  user_id UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'interviewing', 'under_review', 'accepted', 'rejected')),
  company_name TEXT NOT NULL,
  company_one_liner TEXT,
  company_website TEXT,
  company_description TEXT,
  problem_description TEXT,
  target_customer TEXT,
  solution_description TEXT,
  stage TEXT,
  user_count INTEGER DEFAULT 0,
  mrr DECIMAL(12,2) DEFAULT 0,
  biggest_challenge TEXT,
  why_sanctuary TEXT,
  what_they_want TEXT,
  founders JSONB DEFAULT '[]'::jsonb,
  interview_started_at TIMESTAMPTZ,
  interview_completed_at TIMESTAMPTZ,
  interview_transcript JSONB,
  ai_assessment JSONB,
  ai_score DECIMAL(3,2),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON public.applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON public.applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Partners can view all applications" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'partner'
    )
  );

-- MENTORS TABLE
CREATE TABLE public.mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  name TEXT NOT NULL,
  email TEXT,
  title TEXT,
  company TEXT,
  bio TEXT,
  avatar_url TEXT,
  expertise TEXT[] DEFAULT '{}',
  industries TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'limited', 'unavailable')),
  max_mentees INTEGER DEFAULT 3,
  current_mentees INTEGER DEFAULT 0,
  linkedin_url TEXT,
  calendly_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mentors" ON public.mentors
  FOR SELECT USING (true);

-- MENTOR MATCHES TABLE
CREATE TABLE public.mentor_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id UUID REFERENCES public.startups(id),
  mentor_id UUID REFERENCES public.mentors(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'active', 'completed')),
  match_score DECIMAL(3,2),
  match_reasons JSONB,
  requested_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mentor_matches ENABLE ROW LEVEL SECURITY;

-- CHECKPOINTS TABLE
CREATE TABLE public.checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id UUID REFERENCES public.startups(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;

-- METRICS TABLE
CREATE TABLE public.metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id UUID REFERENCES public.startups(id),
  date DATE NOT NULL,
  mrr DECIMAL(12,2),
  arr DECIMAL(12,2),
  active_users INTEGER,
  total_users INTEGER,
  churn_rate DECIMAL(5,2),
  burn_rate DECIMAL(12,2),
  runway_months INTEGER,
  nps_score INTEGER,
  custom_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

-- DOCUMENTS TABLE
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id UUID REFERENCES public.startups(id),
  uploaded_by UUID REFERENCES public.users(id),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('pitch_deck', 'financials', 'legal', 'product', 'other')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  version INTEGER DEFAULT 1,
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_startups_updated_at BEFORE UPDATE ON public.startups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON public.mentors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_mentor_matches_updated_at BEFORE UPDATE ON public.mentor_matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_checkpoints_updated_at BEFORE UPDATE ON public.checkpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_user_type ON public.users(user_type);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_startups_status ON public.startups(status);
CREATE INDEX idx_metrics_startup_date ON public.metrics(startup_id, date);
CREATE INDEX idx_checkpoints_startup ON public.checkpoints(startup_id);
CREATE INDEX idx_mentor_matches_startup ON public.mentor_matches(startup_id);
CREATE INDEX idx_mentor_matches_mentor ON public.mentor_matches(mentor_id);
