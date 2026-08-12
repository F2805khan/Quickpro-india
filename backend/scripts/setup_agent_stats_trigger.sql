-- Run this in your Supabase SQL Editor to enable automatic Agent Stats rollup

CREATE OR REPLACE FUNCTION public.update_agent_stats_on_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is an update and the status changed, or a new assignment
    IF TG_OP = 'UPDATE' THEN
        -- Only proceed if provider_id is set and status changed
        IF NEW.provider_id IS NOT NULL AND OLD.booking_status IS DISTINCT FROM NEW.booking_status THEN
            -- Update the relevant counters
            UPDATE public.agent_stats
            SET 
                total_jobs = (SELECT COUNT(*) FROM public.bookings WHERE provider_id = NEW.provider_id AND booking_status != 'Cancelled'),
                completed_jobs = (SELECT COUNT(*) FROM public.bookings WHERE provider_id = NEW.provider_id AND booking_status = 'Completed'),
                cancelled_jobs = (SELECT COUNT(*) FROM public.bookings WHERE provider_id = NEW.provider_id AND booking_status = 'Cancelled'),
                last_job_at = CASE WHEN NEW.booking_status = 'Completed' THEN NOW() ELSE last_job_at END,
                updated_at = NOW()
            WHERE agent_id = NEW.provider_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_booking_status_change ON public.bookings;
CREATE TRIGGER on_booking_status_change
    AFTER UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_agent_stats_on_booking();
