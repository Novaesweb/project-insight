-- NovaesWeb v10.0 - Reativação do Coração
CREATE TABLE IF NOT EXISTS public.healthcheck (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text DEFAULT 'NovaesWeb Pulse'
);

-- Segurança de Camada (RLS)
ALTER TABLE public.healthcheck ENABLE ROW LEVEL SECURITY;

-- Permitir leitura/escrita pela service_role para o sistema interno
CREATE POLICY "Enable all for service_role" ON public.healthcheck
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Registro Inicial
INSERT INTO public.healthcheck (name) 
VALUES ('NovaesWeb Pulse 10.0')
ON CONFLICT DO NOTHING;
