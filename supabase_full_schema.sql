-- ######################################################
-- NOVAESWEB - FULL SUPABASE DATABASE SCHEMA
-- Execute este script no SQL Editor do seu novo projeto Supabase
-- ######################################################

-- 1. TABELA DE LEADS (PROSPECÇÃO)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  cidade TEXT,
  estado TEXT,
  documento TEXT,
  nome_negocio TEXT,
  segmento TEXT,
  servicos TEXT[] DEFAULT '{}',
  orcamento TEXT,
  como_conheceu TEXT,
  mensagem TEXT,
  status TEXT NOT NULL DEFAULT 'novo',
  motivo_perda TEXT,
  visualizado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  telefone text,
  documento text,
  cidade text,
  estado text,
  endereco text,
  status text NOT NULL DEFAULT 'ativo',
  avatar text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. TABELA DE PROJETOS
CREATE TABLE IF NOT EXISTS public.projetos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  responsavel text,
  inicio date,
  prazo date,
  status text NOT NULL DEFAULT 'em_aberto',
  valor numeric NOT NULL DEFAULT 0,
  progresso integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. TABELA DE PEDIDOS / FATURAS
CREATE TABLE IF NOT EXISTS public.pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  projeto_id uuid REFERENCES public.projetos(id) ON DELETE SET NULL,
  tipo text NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  data date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.faturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  descricao text NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  data_emissao date NOT NULL DEFAULT CURRENT_DATE,
  vencimento date NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. FINANCEIRO E EXTRAS
CREATE TABLE IF NOT EXISTS public.financeiro (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  tipo text NOT NULL DEFAULT 'entrada',
  valor numeric NOT NULL DEFAULT 0,
  data date NOT NULL DEFAULT CURRENT_DATE,
  vencimento date,
  status text NOT NULL DEFAULT 'pendente',
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.extras_catalogo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  categoria text NOT NULL DEFAULT 'fixo',
  preco_ativacao numeric NOT NULL DEFAULT 0,
  preco_mensal numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ativo',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.extras_clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  extra_id uuid REFERENCES public.extras_catalogo(id) ON DELETE CASCADE NOT NULL,
  categoria text NOT NULL DEFAULT 'fixo',
  preco_ativacao numeric NOT NULL DEFAULT 0,
  preco_mensal numeric NOT NULL DEFAULT 0,
  data_ativacao date NOT NULL DEFAULT CURRENT_DATE,
  data_cancelamento date,
  observacao text,
  status text NOT NULL DEFAULT 'ativo',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. SUPORTE (TICKETS)
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  titulo text NOT NULL,
  descricao text,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  prioridade text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'aberto',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ticket_mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  remetente text NOT NULL DEFAULT 'admin',
  nome text NOT NULL,
  texto text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. REUNIOES E USUARIOS
CREATE TABLE IF NOT EXISTS public.reunioes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  tipo text NOT NULL DEFAULT 'alinhamento',
  data date NOT NULL,
  hora_inicio text NOT NULL,
  hora_fim text NOT NULL,
  link text,
  observacoes text,
  status text NOT NULL DEFAULT 'agendada',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  cargo text,
  acesso text NOT NULL DEFAULT 'editor',
  status text NOT NULL DEFAULT 'ativo',
  avatar text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. CONTRATOS E ATUALIZAÇÕES
CREATE TABLE IF NOT EXISTS public.contratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  descricao text,
  corpo text,
  modelo text,
  assinatura_admin text,
  assinatura_cliente text,
  valor numeric NOT NULL DEFAULT 0,
  data_envio date NOT NULL DEFAULT CURRENT_DATE,
  data_assinatura date,
  status text NOT NULL DEFAULT 'aguardando',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projeto_atualizacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id uuid REFERENCES public.projetos(id) ON DELETE CASCADE NOT NULL,
  descricao text NOT NULL,
  visivel_cliente boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. NOTIFICAÇÕES E PUSH (WebPush)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  user_id text NOT NULL,
  user_type text NOT NULL DEFAULT 'admin',
  url text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  tipo text NOT NULL DEFAULT 'projeto',
  lida boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type text NOT NULL DEFAULT 'admin',
  user_id text NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(endpoint)
);

CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);


-- ######################################################
-- RLS POLICIES (SEGURANÇA) - COM PROTEÇÃO CONTRA DUPLICIDADE
-- ######################################################

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extras_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extras_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reunioes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projeto_atualizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas existentes para evitar erros
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Recriação das Políticas
CREATE POLICY "Public insert leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON public.leads FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can do everything clientes" ON public.clientes FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can do everything projetos" ON public.projetos FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can do everything pedidos" ON public.pedidos FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can do everything faturas" ON public.faturas FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can do everything financeiro" ON public.financeiro FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can do everything extras_catalogo" ON public.extras_catalogo FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can do everything extras_clientes" ON public.extras_clientes FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can do everything tickets" ON public.tickets FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can do everything ticket_mensagens" ON public.ticket_mensagens FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can do everything reunioes" ON public.reunioes FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can do everything usuarios" ON public.usuarios FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can do everything contratos" ON public.contratos FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can do everything projeto_atualizacoes" ON public.projeto_atualizacoes FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can do everything notifications" ON public.notifications FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can do everything notificacoes" ON public.notificacoes FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can do everything push_subscriptions" ON public.push_subscriptions FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated can read app_config" ON public.app_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anon can read vapid public key" ON public.app_config FOR SELECT TO anon USING (key = 'vapid_public_key');

-- ######################################################
-- REALTIME CONFIGURATION - COM PROTEÇÃO
-- ######################################################

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['leads','clientes','tickets','reunioes','pedidos','financeiro','notifications','faturas','contratos'])
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END$$;
