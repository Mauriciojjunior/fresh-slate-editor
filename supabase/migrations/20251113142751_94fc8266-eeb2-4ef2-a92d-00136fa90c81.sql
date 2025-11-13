-- Add INSERT policy to allow authenticated users to create their own activity logs
CREATE POLICY "Allow authenticated users to insert logs" 
ON public.activity_logs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add explicit UPDATE and DELETE policies restricted to admins only
CREATE POLICY "Only admins can update logs" 
ON public.activity_logs 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete logs" 
ON public.activity_logs 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));