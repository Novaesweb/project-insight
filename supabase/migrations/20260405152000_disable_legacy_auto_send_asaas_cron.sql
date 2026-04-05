-- Desativa o cron legado que chamava a function auto-send-asaas usando apenas anon key.
-- Para reativar com segurança, recrie o job com um header x-internal-cron-secret
-- ou outra credencial interna não pública.
DO $$
DECLARE
  legacy_job_id bigint;
BEGIN
  SELECT jobid
  INTO legacy_job_id
  FROM cron.job
  WHERE jobname = 'auto-send-asaas-daily'
  LIMIT 1;

  IF legacy_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(legacy_job_id);
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END;
$$;
