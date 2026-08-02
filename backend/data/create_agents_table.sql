-- SQL to create the agents table in Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    photo TEXT,
    status TEXT DEFAULT 'offline',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Note: In Supabase, the uuid_generate_v4() function is available by default via the 'uuid-ossp' extension.
-- If the extension isn't enabled, enable it with: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
