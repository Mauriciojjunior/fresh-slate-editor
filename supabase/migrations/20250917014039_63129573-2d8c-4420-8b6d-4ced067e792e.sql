-- Create book categories table
CREATE TABLE public.book_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drink types table
CREATE TABLE public.drink_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drink_types ENABLE ROW LEVEL SECURITY;

-- Create policies for book_categories
CREATE POLICY "Everyone can view book categories" 
ON public.book_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert book categories" 
ON public.book_categories 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update book categories" 
ON public.book_categories 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete book categories" 
ON public.book_categories 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Create policies for drink_types
CREATE POLICY "Everyone can view drink types" 
ON public.drink_types 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert drink types" 
ON public.drink_types 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update drink types" 
ON public.drink_types 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete drink types" 
ON public.drink_types 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_book_categories_updated_at
BEFORE UPDATE ON public.book_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drink_types_updated_at
BEFORE UPDATE ON public.drink_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial data
INSERT INTO public.book_categories (name, description) VALUES
('Ficção', 'Livros de ficção e literatura'),
('Não-ficção', 'Livros informativos e educacionais'),
('Romance', 'Livros românticos'),
('Suspense', 'Livros de suspense e mistério'),
('Fantasia', 'Livros de fantasia e ficção científica'),
('Biografia', 'Biografias e autobiografias'),
('História', 'Livros sobre história'),
('Ciência', 'Livros científicos e técnicos');

INSERT INTO public.drink_types (name, description) VALUES
('Refrigerante', 'Bebidas gaseificadas'),
('Suco', 'Sucos naturais e industrializados'),
('Água', 'Água mineral e com sabor'),
('Cerveja', 'Cervejas nacionais e importadas'),
('Vinho', 'Vinhos tintos, brancos e rosés'),
('Destilado', 'Cachaça, whisky, vodka, etc.'),
('Licor', 'Licores e cremes'),
('Energético', 'Bebidas energéticas'),
('Chá', 'Chás e infusões'),
('Café', 'Café e derivados');