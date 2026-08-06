-- Run this in your Supabase SQL Editor to add the new agent fields

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'Pending Verification',
ADD COLUMN IF NOT EXISTS documentation_url TEXT,
ADD COLUMN IF NOT EXISTS kyc_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS skills TEXT,
ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_jobs_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS earnings NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS latitude TEXT,
ADD COLUMN IF NOT EXISTS longitude TEXT;
