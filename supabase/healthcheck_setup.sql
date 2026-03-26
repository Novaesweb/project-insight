-- WebNovaX v10.0 ARCHITECT - Bancada de Saúde
-- Padronização: healthcheck (sem underscore)

CREATE TABLE IF NOT EXISTS public.healthcheck (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text DEFAULT 'WebNovaX Pulse'
);

-- Habilitar RLS (Segurança de Camada)
ALTER TABLE public.healthcheck ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pela service_role (usada no backend API)
CREATE POLICY "Enable service_role access" ON public.healthcheck
  FOR SELECT TO service_role USING (true);

-- Registro de Ativação Inicial
INSERT INTO public.healthcheck (name) 
SELECT 'WebNovaX Pulse'
WHERE NOT EXISTS (SELECT 1 FROM public.healthcheck);
