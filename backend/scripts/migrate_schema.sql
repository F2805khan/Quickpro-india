CREATE TABLE IF NOT EXISTS public.admin_alerts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text,
    message text,
    type text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    action text,
    admin_id text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);
