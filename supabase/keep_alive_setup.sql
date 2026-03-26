-- SQL para Sistema Keep-Alive WebNovaX
CREATE TABLE IF NOT EXISTS public.health_check (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  last_ping timestamp with time zone DEFAULT now(),
  name text DEFAULT 'WebNovaX Keeper' UNIQUE
);

-- Inserir registro inicial
INSERT INTO public.health_check (name) 
VALUES ('WebNovaX Keeper')
ON CONFLICT (name) DO NOTHING;
