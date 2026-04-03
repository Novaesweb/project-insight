
-- Tabela de observações internas reutilizável
CREATE TABLE IF NOT EXISTS public.internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  content text NOT NULL,
  created_by text NOT NULL DEFAULT 'admin',
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage internal_notes"
  ON public.internal_notes FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE INDEX idx_internal_notes_entity ON public.internal_notes (entity_type, entity_id);
