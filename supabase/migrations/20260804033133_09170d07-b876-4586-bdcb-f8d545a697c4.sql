ALTER TABLE public.signups
  ADD COLUMN IF NOT EXISTS confirmation_token text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  ADD COLUMN IF NOT EXISTS confirmation_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

UPDATE public.signups SET confirmed_at = created_at WHERE confirmed_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS signups_confirmation_token_idx ON public.signups (confirmation_token);