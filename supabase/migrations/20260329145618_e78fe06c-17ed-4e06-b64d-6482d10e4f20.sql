
-- Table for demo sites manageable from admin
CREATE TABLE IF NOT EXISTS public.demo_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  link text NOT NULL,
  imagem_url text,
  ordem integer DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.demo_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read demo_sites" ON public.demo_sites
  FOR SELECT USING (true);

CREATE POLICY "Admin manage demo_sites" ON public.demo_sites
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Store WhatsApp number in app_config
INSERT INTO public.app_config (key, value) 
VALUES ('whatsapp_number', '5511999999999')
ON CONFLICT (key) DO NOTHING;

-- Seed existing demos
INSERT INTO public.demo_sites (nome, descricao, link, ordem) VALUES
  ('Bella Massa', 'Site completo para pizzaria com cardápio digital e pedidos online.', 'https://bellamassa0.vercel.app/', 1),
  ('Barbearia', 'Sistema de agendamento simples e profissional para barbearias.', 'https://barber00.vercel.app/', 2),
  ('Pizzaria Fogo', 'Plataforma completa com pedidos integrados e painel administrativo.', 'https://pizzariafogo.novaesweb.site/', 3),
  ('Açaí Delivery', 'Loja online para venda de açaí com controle de pedidos.', 'https://demoacai.vercel.app/', 4);
