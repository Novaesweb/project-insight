-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADICIONAR COLUNAS DE INDICAÇÃO EM CLIENTES E LEADS
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS referred_by_id UUID REFERENCES public.clientes(id);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- 2. TABELA DE REVENDEDORES
CREATE TABLE IF NOT EXISTS public.revendedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  whatsapp TEXT,
  pix_key TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'ativo', -- 'ativo', 'suspenso', 'pendente'
  saldo_comissao NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. TABELA DE COMISSÕES
CREATE TABLE IF NOT EXISTS public.comissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revendedor_id UUID REFERENCES public.revendedores(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  valor NUMERIC NOT NULL,
  descricao TEXT,
  status_pagamento TEXT DEFAULT 'pendente', -- 'pendente', 'pago', 'cancelado'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. TABELA DE SOLICITAÇÕES DE SAQUE
CREATE TABLE IF NOT EXISTS public.saques_revenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revendedor_id UUID REFERENCES public.revendedores(id) ON DELETE CASCADE,
  valor NUMERIC NOT NULL,
  pix_key TEXT NOT NULL,
  status TEXT DEFAULT 'pendente', -- 'pendente', 'pago', 'recusado'
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  pago_at TIMESTAMP WITH TIME ZONE
);

-- 5. ATIVAR RLS
ALTER TABLE public.revendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saques_revenda ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS DE SEGURANÇA (REFERÊNCIA BÁSICA)
-- Revendedores podem ver seus próprios dados
CREATE POLICY "Revendedores veem seus dados" ON public.revendedores
  FOR SELECT TO authenticated USING (email = auth.jwt() ->> 'email');

-- Comissões visíveis para o revendedor dono
CREATE POLICY "Revendedores veem suas comissões" ON public.comissoes
  FOR SELECT TO authenticated USING (revendedor_id IN (SELECT id FROM public.revendedores WHERE email = auth.jwt() ->> 'email'));

-- Saques visíveis para o revendedor dono
CREATE POLICY "Revendedores veem seus saques" ON public.saques_revenda
  FOR SELECT TO authenticated USING (revendedor_id IN (SELECT id FROM public.revendedores WHERE email = auth.jwt() ->> 'email'));

-- Admin tem acesso total
CREATE POLICY "Admins tem acesso total revenda" ON public.revendedores
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.usuarios));

CREATE POLICY "Admins tem acesso total comissoes" ON public.comissoes
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.usuarios));

CREATE POLICY "Admins tem acesso total saques" ON public.saques_revenda
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.usuarios));
