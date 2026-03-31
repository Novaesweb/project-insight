ALTER TABLE public.recurrent_billing_history 
ADD COLUMN IF NOT EXISTS vencimento date;