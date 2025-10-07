-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.book_categories(id),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create records table
CREATE TABLE public.records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist TEXT NOT NULL,
  album TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('vinil', 'cd')),
  image_url TEXT,
  is_new BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on books table
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for books
CREATE POLICY "Everyone can view books" 
ON public.books 
FOR SELECT 
USING (true);

CREATE POLICY "Users with write permission can insert books" 
ON public.books 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users with write permission can update books" 
ON public.books 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users with write permission can delete books" 
ON public.books 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Enable RLS on records table
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for records
CREATE POLICY "Everyone can view records" 
ON public.records 
FOR SELECT 
USING (true);

CREATE POLICY "Users with write permission can insert records" 
ON public.records 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users with write permission can update records" 
ON public.records 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users with write permission can delete records" 
ON public.records 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('book-images', 'book-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('record-images', 'record-images', true);

-- Create storage policies for book images
CREATE POLICY "Book images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'book-images');

CREATE POLICY "Authenticated users can upload book images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'book-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update book images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'book-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete book images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'book-images' AND auth.uid() IS NOT NULL);

-- Create storage policies for record images
CREATE POLICY "Record images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'record-images');

CREATE POLICY "Authenticated users can upload record images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'record-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update record images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'record-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete record images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'record-images' AND auth.uid() IS NOT NULL);

-- Add triggers for updated_at
CREATE TRIGGER update_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_records_updated_at
BEFORE UPDATE ON public.records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();