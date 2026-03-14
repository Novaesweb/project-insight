
-- Clientes table
CREATE TABLE public.clientes (
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
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view clientes" ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert clientes" ON public.clientes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update clientes" ON public.clientes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete clientes" ON public.clientes FOR DELETE TO authenticated USING (true);

-- Projetos table
CREATE TABLE public.projetos (
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
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view projetos" ON public.projetos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert projetos" ON public.projetos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update projetos" ON public.projetos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete projetos" ON public.projetos FOR DELETE TO authenticated USING (true);

-- Pedidos table
CREATE TABLE public.pedidos (
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
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view pedidos" ON public.pedidos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert pedidos" ON public.pedidos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update pedidos" ON public.pedidos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete pedidos" ON public.pedidos FOR DELETE TO authenticated USING (true);

-- Extras catalogo
CREATE TABLE public.extras_catalogo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  categoria text NOT NULL DEFAULT 'fixo',
  preco_ativacao numeric NOT NULL DEFAULT 0,
  preco_mensal numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ativo',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.extras_catalogo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view extras_catalogo" ON public.extras_catalogo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert extras_catalogo" ON public.extras_catalogo FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update extras_catalogo" ON public.extras_catalogo FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete extras_catalogo" ON public.extras_catalogo FOR DELETE TO authenticated USING (true);

-- Extras clientes (extras ativados por cliente)
CREATE TABLE public.extras_clientes (
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
ALTER TABLE public.extras_clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view extras_clientes" ON public.extras_clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert extras_clientes" ON public.extras_clientes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update extras_clientes" ON public.extras_clientes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete extras_clientes" ON public.extras_clientes FOR DELETE TO authenticated USING (true);

-- Tickets suporte
CREATE TABLE public.tickets (
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
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view tickets" ON public.tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert tickets" ON public.tickets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update tickets" ON public.tickets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete tickets" ON public.tickets FOR DELETE TO authenticated USING (true);

-- Mensagens de ticket
CREATE TABLE public.ticket_mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  remetente text NOT NULL DEFAULT 'admin',
  nome text NOT NULL,
  texto text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ticket_mensagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view ticket_mensagens" ON public.ticket_mensagens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert ticket_mensagens" ON public.ticket_mensagens FOR INSERT TO authenticated WITH CHECK (true);

-- Financeiro
CREATE TABLE public.financeiro (
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
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view financeiro" ON public.financeiro FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert financeiro" ON public.financeiro FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update financeiro" ON public.financeiro FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete financeiro" ON public.financeiro FOR DELETE TO authenticated USING (true);

-- Reunioes
CREATE TABLE public.reunioes (
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
ALTER TABLE public.reunioes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view reunioes" ON public.reunioes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert reunioes" ON public.reunioes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update reunioes" ON public.reunioes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete reunioes" ON public.reunioes FOR DELETE TO authenticated USING (true);

-- Usuarios internos
CREATE TABLE public.usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  cargo text,
  acesso text NOT NULL DEFAULT 'editor',
  status text NOT NULL DEFAULT 'ativo',
  avatar text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view usuarios" ON public.usuarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert usuarios" ON public.usuarios FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update usuarios" ON public.usuarios FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete usuarios" ON public.usuarios FOR DELETE TO authenticated USING (true);

-- Contratos
CREATE TABLE public.contratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  descricao text,
  valor numeric NOT NULL DEFAULT 0,
  data_envio date NOT NULL DEFAULT CURRENT_DATE,
  data_assinatura date,
  status text NOT NULL DEFAULT 'aguardando',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view contratos" ON public.contratos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert contratos" ON public.contratos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update contratos" ON public.contratos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete contratos" ON public.contratos FOR DELETE TO authenticated USING (true);

-- Faturas
CREATE TABLE public.faturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  descricao text NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  data_emissao date NOT NULL DEFAULT CURRENT_DATE,
  vencimento date NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view faturas" ON public.faturas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert faturas" ON public.faturas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update faturas" ON public.faturas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete faturas" ON public.faturas FOR DELETE TO authenticated USING (true);

-- Notificações
CREATE TABLE public.notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  tipo text NOT NULL DEFAULT 'projeto',
  lida boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view notificacoes" ON public.notificacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert notificacoes" ON public.notificacoes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update notificacoes" ON public.notificacoes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Projeto atualizações
CREATE TABLE public.projeto_atualizacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id uuid REFERENCES public.projetos(id) ON DELETE CASCADE NOT NULL,
  descricao text NOT NULL,
  visivel_cliente boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.projeto_atualizacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view projeto_atualizacoes" ON public.projeto_atualizacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert projeto_atualizacoes" ON public.projeto_atualizacoes FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.clientes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reunioes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.financeiro;
