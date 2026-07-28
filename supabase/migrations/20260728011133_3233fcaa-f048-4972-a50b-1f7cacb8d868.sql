CREATE TABLE public.signups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  city text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.signups TO anon;
GRANT INSERT ON public.signups TO authenticated;
GRANT ALL ON public.signups TO service_role;

ALTER TABLE public.signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join the waitlist"
ON public.signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);