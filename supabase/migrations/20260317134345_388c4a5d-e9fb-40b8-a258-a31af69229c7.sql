
-- Create ticket_mensagens table for support chat
CREATE TABLE public.ticket_mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets_suporte(id) ON DELETE CASCADE,
  remetente TEXT NOT NULL DEFAULT 'cliente',
  nome TEXT,
  texto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage ticket_mensagens" ON public.ticket_mensagens FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Client can view own ticket messages" ON public.ticket_mensagens FOR SELECT TO public USING (EXISTS (SELECT 1 FROM tickets_suporte t JOIN clientes c ON c.id = t.cliente_id WHERE t.id = ticket_mensagens.ticket_id AND c.user_id = auth.uid()));
CREATE POLICY "Client can insert own ticket messages" ON public.ticket_mensagens FOR INSERT TO public WITH CHECK (EXISTS (SELECT 1 FROM tickets_suporte t JOIN clientes c ON c.id = t.cliente_id WHERE t.id = ticket_mensagens.ticket_id AND c.user_id = auth.uid()));

-- Create projeto_atualizacoes table
CREATE TABLE public.projeto_atualizacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  projeto_id UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  visivel_cliente BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projeto_atualizacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage projeto_atualizacoes" ON public.projeto_atualizacoes FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Client can view visible updates" ON public.projeto_atualizacoes FOR SELECT TO public USING (visivel_cliente = true AND EXISTS (SELECT 1 FROM projetos p JOIN clientes c ON c.id = p.cliente_id WHERE p.id = projeto_atualizacoes.projeto_id AND c.user_id = auth.uid()));

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_mensagens;
