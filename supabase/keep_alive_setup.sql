-- SQL para Sistema Keep-Alive WebNovaX (Versão Segura)
DROP TABLE IF EXISTS public.health_check CASCADE;

CREATE TABLE public.health_check (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  last_ping timestamp with time zone DEFAULT now(),
  name text DEFAULT 'WebNovaX Keeper' UNIQUE
);

-- Inserir registro inicial
INSERT INTO public.health_check (name) 
VALUES ('WebNovaX Keeper');
