-- Tabela para gestão de arquivos de projetos
CREATE TABLE IF NOT EXISTS public.projeto_arquivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id uuid REFERENCES public.projetos(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  url text NOT NULL,
  tipo text, -- 'pdf', 'img', 'doc', etc.
  tamanho numeric,
  enviado_por text DEFAULT 'admin', -- 'admin' ou 'cliente'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ADICIONAR COLUNAS DE BRIEFING E REFERENCIAS CASO NÃO EXISTAM
ALTER TABLE public.projetos ADD COLUMN IF NOT EXISTS briefing TEXT;
ALTER TABLE public.projetos ADD COLUMN IF NOT EXISTS referencias TEXT;

-- Ativar RLS
ALTER TABLE public.projeto_arquivos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para arquivos
CREATE POLICY "Permitir leitura de arquivos para admins" ON public.projeto_arquivos
  FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.usuarios));

CREATE POLICY "Permitir leitura de seus próprios arquivos para clientes" ON public.projeto_arquivos
  FOR SELECT TO authenticated USING (
    projeto_id IN (SELECT id FROM public.projetos WHERE cliente_id = (SELECT id FROM public.clientes WHERE email = auth.jwt() ->> 'email'))
  );

CREATE POLICY "Permitir upload de arquivos" ON public.projeto_arquivos
  FOR INSERT TO authenticated WITH CHECK (true);

-- CONFIGURAÇÃO DO STORAGE (BUCKET) Caso não tenha feito pelo painel
-- Habilitar storage se necessário
INSERT INTO storage.buckets (id, name, public) 
VALUES ('projeto-arquivos', 'projeto-arquivos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para o bucket projeto-arquivos
CREATE POLICY "Visualização pública de arquivos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'projeto-arquivos' );

CREATE POLICY "Upload permitido para usuários autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'projeto-arquivos' );

CREATE POLICY "Deleção permitida para usuários autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'projeto-arquivos' );
