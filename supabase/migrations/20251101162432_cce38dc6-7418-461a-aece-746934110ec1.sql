-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, approved)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    -- Auto-approve if this is the first user (will be admin)
    NOT EXISTS (SELECT 1 FROM auth.users WHERE id != new.id)
  );
  
  -- Create default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user'::app_role);
  
  RETURN new;
END;
$$;

-- Backfill email for existing users (will need manual update for actual emails)
UPDATE public.profiles 
SET email = 'email@exemplo.com'
WHERE email IS NULL;