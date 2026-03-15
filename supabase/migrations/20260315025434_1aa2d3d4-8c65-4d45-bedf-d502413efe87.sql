
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['ticket_mensagens','projetos','projeto_atualizacoes','faturas','extras_clientes','contratos','notificacoes','pedidos'])
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END$$;
