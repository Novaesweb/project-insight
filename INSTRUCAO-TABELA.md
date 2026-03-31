# 🚨 URGENTE: Criar Tabela no Supabase

## Problema Identificado
O painel admin está com tela preta porque a tabela `recurrent_billing_history` não existe no Supabase.

## Solução Imediata

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Selecione seu projeto

### 2. Vá para SQL Editor
- No menu lateral, clique em "SQL Editor"

### 3. Execute o SQL

```sql
-- Criar tabela de histórico de cobranças recorrentes
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

-- Criar política de acesso para admin
CREATE POLICY "Admin full access" ON public.recurrent_billing_history
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'role' = 'admin');

-- Criar política de acesso para leitura
CREATE POLICY "Read access" ON public.recurrent_billing_history
    FOR SELECT
    TO authenticated
    USING (auth.jwt()->>'role' IN ('admin', 'authenticated'));
```

### 4. Após Executar
- A tabela será criada
- O painel admin deve funcionar
- O histórico de cobranças recorrentes estará disponível

### 5. Atualizar o Código (IMPORTANTE!)
- Depois de criar a tabela, remova o código temporário do `AdminRecurrentHistory.tsx`
- Substitua `TempHistory` por `RecurrentBillingHistory` importado do `recurrent-billing-history.ts`
- Descomente a linha: `// import { RecurrentBillingHistory, RecurrentBillingHistoryService } from "@/lib/recurrent-billing-history";`

## Importante
- Execute isso URGENTEMENTE no Supabase
- Sem isso, o painel admin continuará com tela preta
- O sistema completo depende desta tabela

## ✅ SQL CORRIGIDO
- **Erro anterior**: `WITH CHECK cannot be applied to SELECT or DELETE`
- **Solução**: Removido `WITH CHECK` das políticas RLS
- **Resultado**: SQL válido e funcional
