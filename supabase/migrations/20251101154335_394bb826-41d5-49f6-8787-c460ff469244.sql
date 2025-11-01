-- Add approved column to profiles table
ALTER TABLE public.profiles
ADD COLUMN approved BOOLEAN NOT NULL DEFAULT false;

-- Create a function to check if user is approved
CREATE OR REPLACE FUNCTION public.is_user_approved(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT approved FROM public.profiles WHERE id = user_id),
    false
  );
$$;

-- Update RLS policies to check approval status
-- Note: We'll keep the basic profile policies but add approval checks to other tables

-- Update books RLS policies
DROP POLICY IF EXISTS "Users with write permission can insert books" ON public.books;
DROP POLICY IF EXISTS "Users with write permission can update books" ON public.books;
DROP POLICY IF EXISTS "Users with write permission can delete books" ON public.books;

CREATE POLICY "Approved users can insert books"
ON public.books
FOR INSERT
TO authenticated
WITH CHECK (is_user_approved(auth.uid()));

CREATE POLICY "Approved users can update books"
ON public.books
FOR UPDATE
TO authenticated
USING (is_user_approved(auth.uid()));

CREATE POLICY "Approved users can delete books"
ON public.books
FOR DELETE
TO authenticated
USING (is_user_approved(auth.uid()));

-- Update drinks RLS policies
DROP POLICY IF EXISTS "Users with write permission can insert drinks" ON public.drinks;
DROP POLICY IF EXISTS "Users with write permission can update drinks" ON public.drinks;
DROP POLICY IF EXISTS "Users with write permission can delete drinks" ON public.drinks;

CREATE POLICY "Approved users can insert drinks"
ON public.drinks
FOR INSERT
TO authenticated
WITH CHECK (is_user_approved(auth.uid()));

CREATE POLICY "Approved users can update drinks"
ON public.drinks
FOR UPDATE
TO authenticated
USING (is_user_approved(auth.uid()));

CREATE POLICY "Approved users can delete drinks"
ON public.drinks
FOR DELETE
TO authenticated
USING (is_user_approved(auth.uid()));

-- Update records RLS policies
DROP POLICY IF EXISTS "Users with write permission can insert records" ON public.records;
DROP POLICY IF EXISTS "Users with write permission can update records" ON public.records;
DROP POLICY IF EXISTS "Users with write permission can delete records" ON public.records;

CREATE POLICY "Approved users can insert records"
ON public.records
FOR INSERT
TO authenticated
WITH CHECK (is_user_approved(auth.uid()));

CREATE POLICY "Approved users can update records"
ON public.records
FOR UPDATE
TO authenticated
USING (is_user_approved(auth.uid()));

CREATE POLICY "Approved users can delete records"
ON public.records
FOR DELETE
TO authenticated
USING (is_user_approved(auth.uid()));

-- Update board_games RLS policies
DROP POLICY IF EXISTS "Users with write permission can insert board games" ON public.board_games;
DROP POLICY IF EXISTS "Users with write permission can update board games" ON public.board_games;
DROP POLICY IF EXISTS "Users with write permission can delete board games" ON public.board_games;

CREATE POLICY "Approved users can insert board games"
ON public.board_games
FOR INSERT
TO authenticated
WITH CHECK (is_user_approved(auth.uid()));

CREATE POLICY "Approved users can update board games"
ON public.board_games
FOR UPDATE
TO authenticated
USING (is_user_approved(auth.uid()));

CREATE POLICY "Approved users can delete board games"
ON public.board_games
FOR DELETE
TO authenticated
USING (is_user_approved(auth.uid()));

-- Allow admins to view and update approval status of all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update approval status"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Ensure first admin user is auto-approved
-- This updates the trigger to auto-approve admin users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, approved)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'full_name',
    -- Auto-approve if this is the first user (will be admin)
    NOT EXISTS (SELECT 1 FROM auth.users WHERE id != new.id)
  );
  
  -- Create default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user'::app_role);
  
  RETURN new;
END;
$$;