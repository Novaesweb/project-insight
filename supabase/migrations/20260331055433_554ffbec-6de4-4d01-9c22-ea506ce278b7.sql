
-- Fix RLS policies on recurrent_billing_history to use is_admin()
DROP POLICY IF EXISTS "Admin full access" ON public.recurrent_billing_history;
DROP POLICY IF EXISTS "Read access" ON public.recurrent_billing_history;

CREATE POLICY "Admin manage recurrent_billing_history"
ON public.recurrent_billing_history
FOR ALL
TO authenticated
USING (is_admin());

CREATE POLICY "Clients view own recurrent_billing_history"
ON public.recurrent_billing_history
FOR SELECT
TO authenticated
USING (cliente_id = get_cliente_id());
