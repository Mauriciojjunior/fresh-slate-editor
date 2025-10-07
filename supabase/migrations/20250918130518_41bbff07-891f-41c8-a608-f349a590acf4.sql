-- Create drinks table
CREATE TABLE public.drinks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type_id UUID NOT NULL REFERENCES public.drink_types(id),
  manufacturing_location TEXT,
  grape_type TEXT,
  image_url TEXT,
  needs_to_buy BOOLEAN NOT NULL DEFAULT false,
  is_finished BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create board_games table
CREATE TABLE public.board_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on drinks table
ALTER TABLE public.drinks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for drinks
CREATE POLICY "Everyone can view drinks" 
ON public.drinks 
FOR SELECT 
USING (true);

CREATE POLICY "Users with write permission can insert drinks" 
ON public.drinks 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users with write permission can update drinks" 
ON public.drinks 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users with write permission can delete drinks" 
ON public.drinks 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Enable RLS on board_games table
ALTER TABLE public.board_games ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for board_games
CREATE POLICY "Everyone can view board games" 
ON public.board_games 
FOR SELECT 
USING (true);

CREATE POLICY "Users with write permission can insert board games" 
ON public.board_games 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users with write permission can update board games" 
ON public.board_games 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users with write permission can delete board games" 
ON public.board_games 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('drink-images', 'drink-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('game-images', 'game-images', true);

-- Create storage policies for drink images
CREATE POLICY "Drink images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'drink-images');

CREATE POLICY "Authenticated users can upload drink images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'drink-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update drink images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'drink-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete drink images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'drink-images' AND auth.uid() IS NOT NULL);

-- Create storage policies for game images
CREATE POLICY "Game images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'game-images');

CREATE POLICY "Authenticated users can upload game images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'game-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update game images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'game-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete game images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'game-images' AND auth.uid() IS NOT NULL);

-- Add triggers for updated_at
CREATE TRIGGER update_drinks_updated_at
BEFORE UPDATE ON public.drinks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_board_games_updated_at
BEFORE UPDATE ON public.board_games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();