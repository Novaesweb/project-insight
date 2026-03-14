
-- Create leads table
CREATE TABLE public.leads (
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

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form)
CREATE POLICY "Anyone can submit leads" ON public.leads
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users can view
CREATE POLICY "Authenticated can view leads" ON public.leads
FOR SELECT TO authenticated
USING (true);

-- Only authenticated users can update
CREATE POLICY "Authenticated can update leads" ON public.leads
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- Only authenticated users can delete
CREATE POLICY "Authenticated can delete leads" ON public.leads
FOR DELETE TO authenticated
USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
