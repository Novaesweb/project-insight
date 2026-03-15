
-- Table for storing push notification subscriptions
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type text NOT NULL DEFAULT 'admin',
  user_id text NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage push_subscriptions"
  ON public.push_subscriptions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can insert push_subscriptions"
  ON public.push_subscriptions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Table for storing app configuration like VAPID keys
CREATE TABLE public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read app_config"
  ON public.app_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anon can read vapid public key"
  ON public.app_config FOR SELECT
  TO anon
  USING (key = 'vapid_public_key');
