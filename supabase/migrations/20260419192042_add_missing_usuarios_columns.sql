/*
  # Add missing columns to usuarios table

  ## Summary
  Adds columns required by the admin login flow that are missing from the usuarios table:
  - `bloqueado` - boolean flag to block user access
  - `tentativas_login` - counter for failed login attempts
  - `codigo_desbloqueio` - unlock code for blocked accounts
*/

ALTER TABLE public.usuarios 
  ADD COLUMN IF NOT EXISTS bloqueado boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tentativas_login integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS codigo_desbloqueio text;
