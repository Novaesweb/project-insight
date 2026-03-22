-- ######################################################
-- NOVAESWEB - CARDÁPIO INTERATIVO & GESTÃO DE PEDIDOS
-- ######################################################

-- 1. CATEGORIAS DO CARDÁPIO
CREATE TABLE IF NOT EXISTS public.menu_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ITENS DO CARDÁPIO
CREATE TABLE IF NOT EXISTS public.menu_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  categoria_id UUID REFERENCES public.menu_categorias(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC NOT NULL DEFAULT 0,
  imagem TEXT,
  opcoes JSONB DEFAULT '[]'::jsonb, -- Ex: [{"nome": "Queijo Extra", "preco": 5.00}]
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PEDIDOS DO CARDÁPIO (SISTEMA DE FOME)
CREATE TABLE IF NOT EXISTS public.menu_pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  customer_nome TEXT NOT NULL,
  customer_whatsapp TEXT,
  customer_endereco TEXT,
  itens JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de itens comprados
  total NUMERIC NOT NULL DEFAULT 0,
  metodo_pagamento TEXT, -- 'pix', 'dinheiro', 'cartao'
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'preparando', 'em_rota', 'finalizado', 'cancelado'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. ADICIONAR COLUNA DE TRIAL NA TABELA DE CLIENTES
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- ######################################################
-- RLS POLICIES
-- ######################################################

ALTER TABLE public.menu_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública para o Menu (Visitantes)
CREATE POLICY "Public read categories" ON public.menu_categorias FOR SELECT USING (true);
CREATE POLICY "Public read items" ON public.menu_itens FOR SELECT USING (true);

-- Política para Clientes gerenciarem seus próprios dados
CREATE POLICY "Clientes manage categories" ON public.menu_categorias FOR ALL USING (cliente_id = auth.uid()) WITH CHECK (cliente_id = auth.uid());
CREATE POLICY "Clientes manage items" ON public.menu_itens FOR ALL USING (cliente_id = auth.uid()) WITH CHECK (cliente_id = auth.uid());
CREATE POLICY "Clientes manage pedidos" ON public.menu_pedidos FOR ALL USING (cliente_id = auth.uid()) WITH CHECK (cliente_id = auth.uid());

-- Permitir que visitantes insiram pedidos
CREATE POLICY "Public insert pedidos" ON public.menu_pedidos FOR INSERT WITH CHECK (true);

-- ######################################################
-- REALTIME
-- ######################################################
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_pedidos;
