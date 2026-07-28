DROP POLICY IF EXISTS "Anyone can join the waitlist" ON public.signups;

CREATE POLICY "Anyone can join the waitlist"
ON public.signups
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(full_name)) BETWEEN 1 AND 100
  AND length(btrim(email)) BETWEEN 5 AND 255
  AND email ~* '^[A-Za-z0-9._%%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(btrim(city)) BETWEEN 1 AND 100
  AND length(btrim(message)) BETWEEN 1 AND 2000
);