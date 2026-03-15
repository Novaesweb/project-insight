CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  user_id text NOT NULL,
  user_type text NOT NULL DEFAULT 'admin',
  url text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view notifications" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update notifications" ON public.notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.notifications FOR ALL TO service_role USING (true) WITH CHECK (true);