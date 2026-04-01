
-- Remove duplicates keeping the oldest record per (cliente_id, mes)
DELETE FROM recurrent_billing_history a
USING recurrent_billing_history b
WHERE a.cliente_id = b.cliente_id
  AND a.mes = b.mes
  AND a.created_at > b.created_at;

-- Add unique constraint to prevent future duplicates
ALTER TABLE recurrent_billing_history
  ADD CONSTRAINT unique_cliente_mes UNIQUE (cliente_id, mes);
