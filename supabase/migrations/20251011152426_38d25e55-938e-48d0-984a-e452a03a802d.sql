-- Create activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for better query performance
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view all logs"
ON public.activity_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add last_login_at to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Add action_count to track user activity
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS action_count INTEGER DEFAULT 0;

-- Function to update last login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_login_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Trigger to update last login on auth
CREATE OR REPLACE TRIGGER on_auth_login
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_last_login();