-- Cron job para envio automático ao Asaas (diário às 09:00 UTC / 06:00 BRT)
-- NOTA: Este SQL contém dados específicos do projeto (URL e anon key)
SELECT cron.schedule(
  'auto-send-asaas-daily',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://mvxlbvfryzmocrafhfjp.supabase.co/functions/v1/auto-send-asaas',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eGxidmZyeXptb2NyYWZoZmpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTgwOTMsImV4cCI6MjA4OTQ5NDA5M30.l3vZib37kooIIMUSdW7dybSYr-4-OsCnq9l0ezyJ2oQ"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);