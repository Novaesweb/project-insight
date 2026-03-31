-- Criar tabela de histórico de cobranças recorrentes (se não existir)
CREATE TABLE IF NOT EXISTS public.recurrent_billing_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    mes VARCHAR(7) NOT NULL, -- Formato: "2026-03"
    ano INTEGER NOT NULL,
    mes_numero INTEGER NOT NULL CHECK (mes_numero >= 1 AND mes_numero <= 12),
    valor_total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pendente', 'pago_manualmente', 'pago_asaas', 'em_atraso')),
    forma_pagamento VARCHAR(10) CHECK (forma_pagamento IN ('manual', 'asaas')),
    data_pagamento DATE,
    financeiro_id UUID REFERENCES public.financeiro(id) ON DELETE SET NULL,
    asaas_payment_id VARCHAR(255),
    asaas_invoice_url TEXT,
    extras_count INTEGER NOT NULL DEFAULT 0,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_recurrent_billing_cliente_mes ON public.recurrent_billing_history(cliente_id, mes);
CREATE INDEX IF NOT EXISTS idx_recurrent_billing_status ON public.recurrent_billing_history(status);
CREATE INDEX IF NOT EXISTS idx_recurrent_billing_created_at ON public.recurrent_billing_history(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.recurrent_billing_history ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso para admin (se não existir)
DROP POLICY IF EXISTS "Admin full access" ON public.recurrent_billing_history;
CREATE POLICY "Admin full access" ON public.recurrent_billing_history
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'role' = 'admin');

-- Criar política de acesso para leitura (se não existir)
DROP POLICY IF EXISTS "Read access" ON public.recurrent_billing_history;
CREATE POLICY "Read access" ON public.recurrent_billing_history
    FOR SELECT
    TO authenticated
    USING (auth.jwt()->>'role' IN ('admin', 'authenticated'));
