-- Habilitar RLS na tabela (caso não esteja habilitado)
ALTER TABLE public.extras_catalogo ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas de leitura pública (se houver e estiverem com defeito)
DROP POLICY IF EXISTS "Permitir leitura anonima" ON public.extras_catalogo;
DROP POLICY IF EXISTS "Leitura publica permitida" ON public.extras_catalogo;

-- Criar política permitindo que qualquer pessoa (mesmo sem estar logada) leia o catálogo
CREATE POLICY "Leitura publica permitida" 
ON public.extras_catalogo 
FOR SELECT 
USING (true);
