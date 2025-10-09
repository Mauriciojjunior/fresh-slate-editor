-- Create grape_types table
CREATE TABLE public.grape_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.grape_types ENABLE ROW LEVEL SECURITY;

-- Create policies for grape_types
CREATE POLICY "Everyone can view grape types" 
ON public.grape_types 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert grape types" 
ON public.grape_types 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update grape types" 
ON public.grape_types 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete grape types" 
ON public.grape_types 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_grape_types_updated_at
BEFORE UPDATE ON public.grape_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();