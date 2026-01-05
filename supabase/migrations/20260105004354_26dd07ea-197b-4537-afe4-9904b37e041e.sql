-- Primeiro, dropar as políticas RLS que dependem de is_user_approved

-- books
DROP POLICY IF EXISTS "Approved users can insert books" ON public.books;
DROP POLICY IF EXISTS "Approved users can update books" ON public.books;
DROP POLICY IF EXISTS "Approved users can delete books" ON public.books;

-- drinks
DROP POLICY IF EXISTS "Approved users can insert drinks" ON public.drinks;
DROP POLICY IF EXISTS "Approved users can update drinks" ON public.drinks;
DROP POLICY IF EXISTS "Approved users can delete drinks" ON public.drinks;

-- records
DROP POLICY IF EXISTS "Approved users can insert records" ON public.records;
DROP POLICY IF EXISTS "Approved users can update records" ON public.records;
DROP POLICY IF EXISTS "Approved users can delete records" ON public.records;

-- board_games
DROP POLICY IF EXISTS "Approved users can insert board games" ON public.board_games;
DROP POLICY IF EXISTS "Approved users can update board games" ON public.board_games;
DROP POLICY IF EXISTS "Approved users can delete board games" ON public.board_games;

-- Criar novas políticas usando apenas auth.uid() (usuário autenticado)

-- books
CREATE POLICY "Authenticated users can insert books" ON public.books FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update books" ON public.books FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete books" ON public.books FOR DELETE USING (auth.uid() IS NOT NULL);

-- drinks
CREATE POLICY "Authenticated users can insert drinks" ON public.drinks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update drinks" ON public.drinks FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete drinks" ON public.drinks FOR DELETE USING (auth.uid() IS NOT NULL);

-- records
CREATE POLICY "Authenticated users can insert records" ON public.records FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update records" ON public.records FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete records" ON public.records FOR DELETE USING (auth.uid() IS NOT NULL);

-- board_games
CREATE POLICY "Authenticated users can insert board games" ON public.board_games FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update board games" ON public.board_games FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete board games" ON public.board_games FOR DELETE USING (auth.uid() IS NOT NULL);

-- Agora remover a função is_user_approved
DROP FUNCTION IF EXISTS public.is_user_approved(uuid);

-- Remover a coluna approved da tabela profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS approved;

-- Atualizar a função handle_new_user para não incluir approved
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;