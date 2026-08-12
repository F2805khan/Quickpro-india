-- Service Agent Management - Database Schema Migration
-- Run this in your Supabase SQL Editor

-- 1. Create file types and status enums
CREATE TYPE verification_status_enum AS ENUM ('not_submitted', 'under_review', 'verified', 'rejected');
CREATE TYPE agent_status_enum AS ENUM ('pending', 'approved', 'rejected', 'suspended', 'blocked');
CREATE TYPE file_type_enum AS ENUM ('photo', 'aadhaar_front', 'aadhaar_back', 'pan', 'license');

-- 2. Create files table
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_type VARCHAR(50) NOT NULL, -- 'agent', 'booking', etc.
    owner_id UUID NOT NULL,
    file_type file_type_enum NOT NULL,
    storage_path VARCHAR(255) NOT NULL, -- Path in Supabase storage bucket
    mime_type VARCHAR(100),
    size_bytes INTEGER,
    checksum VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create agents table (if not exists)
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) UNIQUE,
    email VARCHAR(255),
    profile_photo_file_id UUID REFERENCES public.files(id) ON DELETE SET NULL,
    status agent_status_enum DEFAULT 'pending' NOT NULL,
    is_online BOOLEAN DEFAULT false,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    
    -- KYC Details
    aadhaar_number VARCHAR(255), -- Store encrypted/masked
    aadhaar_file_id UUID REFERENCES public.files(id) ON DELETE SET NULL,
    aadhaar_back_file_id UUID REFERENCES public.files(id) ON DELETE SET NULL,
    verification_status verification_status_enum DEFAULT 'not_submitted' NOT NULL,
    
    verified_by UUID, -- References admin users if there's an admin table
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Legacy/Additional fields required by app
    skills TEXT,
    rating NUMERIC DEFAULT 0,
    completed_jobs_count INTEGER DEFAULT 0,
    earnings NUMERIC DEFAULT 0,
    latitude NUMERIC,
    longitude NUMERIC,
    documentation_url TEXT,
    kyc_required BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: if `agents` already exists from a previous migration, you may need to run ALTER TABLE statements instead.
-- ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS email VARCHAR(255);
-- ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS profile_photo_file_id UUID REFERENCES public.files(id) ON DELETE SET NULL;
-- (etc...)

-- 4. Create agent_stats table (rollup)
CREATE TABLE IF NOT EXISTS public.agent_stats (
    agent_id UUID PRIMARY KEY REFERENCES public.agents(id) ON DELETE CASCADE,
    total_jobs INTEGER DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    rejected_jobs INTEGER DEFAULT 0,
    cancelled_jobs INTEGER DEFAULT 0,
    avg_rating NUMERIC(3,2) DEFAULT 0.00,
    last_job_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Trigger to auto-create agent_stats when an agent is created
CREATE OR REPLACE FUNCTION public.create_agent_stats_row()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.agent_stats (agent_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_agent_created ON public.agents;
CREATE TRIGGER on_agent_created
  AFTER INSERT ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.create_agent_stats_row();

-- 6. Storage Bucket for files (requires postgres permissions for storage.buckets)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('agent_documents', 'agent_documents', false) ON CONFLICT DO NOTHING;

-- RLS Policies for files (only authenticated service roles / admins can read)
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow backend full access to files" 
ON public.files 
FOR ALL 
USING (auth.role() = 'service_role');
