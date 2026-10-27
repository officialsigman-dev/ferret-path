-- =============================================================
-- 1. Extend signups for the Wisconsin pilot
-- =============================================================
ALTER TABLE public.signups
  ADD COLUMN role text,
  ADD COLUMN county text,
  ADD COLUMN zip text,
  ADD COLUMN grade text,
  ADD COLUMN interest text,
  ADD COLUMN company text,
  ADD COLUMN parent_email text,
  ADD COLUMN utm_source text,
  ADD COLUMN utm_medium text,
  ADD COLUMN utm_campaign text,
  ADD COLUMN ref text,
  ADD COLUMN parent_token text,
  ADD COLUMN parent_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN parent_confirmed_at timestamptz;

-- city and message are no longer required by the new form (legacy rows keep their data)
ALTER TABLE public.signups ALTER COLUMN city DROP NOT NULL;
ALTER TABLE public.signups ALTER COLUMN message DROP NOT NULL;

DROP POLICY IF EXISTS "Anyone can join the waitlist" ON public.signups;
CREATE POLICY "Anyone can join the waitlist" ON public.signups
FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(full_name)) >= 1 AND length(btrim(full_name)) <= 100
  AND length(btrim(email)) >= 5 AND length(btrim(email)) <= 255
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND role IN ('teen_14_17','student_18','parent','employer','school_counselor')
  AND zip IS NOT NULL AND zip ~ '^(53|54)[0-9]{3}$'
  AND county IN (
    'Adams','Ashland','Barron','Bayfield','Brown','Buffalo','Burnett','Calumet',
    'Chippewa','Clark','Columbia','Crawford','Dane','Dodge','Door','Douglas',
    'Dunn','Eau Claire','Florence','Fond du Lac','Forest','Grant','Green','Green Lake',
    'Iowa','Iron','Jackson','Jefferson','Juneau','Kenosha','Kewaunee','La Crosse',
    'Lafayette','Langlade','Lincoln','Manitowoc','Marathon','Marinette','Marquette','Menominee',
    'Milwaukee','Monroe','Oconto','Oneida','Outagamie','Ozaukee','Pepin','Pierce',
    'Polk','Portage','Price','Racine','Richland','Rock','Rusk','Sauk',
    'Sawyer','Shawano','Sheboygan','St. Croix','Taylor','Trempealeau','Vernon','Vilas',
    'Walworth','Washburn','Washington','Waukesha','Waupaca','Waushara','Winnebago','Wood'
  )
  AND (grade IS NULL OR grade IN ('9','10','11','12','not_sure'))
  AND (interest IS NULL OR interest IN ('construction_trades','manufacturing','healthcare','it_tech','agriculture','hospitality','not_sure'))
  AND (company IS NULL OR length(btrim(company)) <= 200)
  AND (parent_email IS NULL OR parent_email = '' OR (
        length(btrim(parent_email)) >= 5 AND length(btrim(parent_email)) <= 255
        AND parent_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'))
  AND (role <> 'teen_14_17' OR (
        parent_email IS NOT NULL AND length(btrim(parent_email)) >= 5
        AND length(btrim(parent_email)) <= 255
        AND parent_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'))
  AND (message IS NULL OR length(btrim(message)) <= 2000)
  AND (utm_source IS NULL OR length(utm_source) <= 100)
  AND (utm_medium IS NULL OR length(utm_medium) <= 100)
  AND (utm_campaign IS NULL OR length(utm_campaign) <= 100)
  AND (ref IS NULL OR length(ref) <= 200)
);

-- =============================================================
-- 2. Region lookups (ZIP -> regional youth apprenticeship contact)
-- =============================================================
CREATE TABLE public.region_lookups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  zip text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  ref text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.region_lookups TO anon, authenticated;
GRANT ALL ON public.region_lookups TO service_role;
GRANT SELECT ON public.region_lookups TO authenticated;
ALTER TABLE public.region_lookups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log a region lookup" ON public.region_lookups
FOR INSERT TO anon, authenticated
WITH CHECK (zip IS NOT NULL AND length(zip) = 5 AND zip ~ '^(53|54)[0-9]{3}$'
  AND (utm_source IS NULL OR length(utm_source) <= 100)
  AND (utm_medium IS NULL OR length(utm_medium) <= 100)
  AND (utm_campaign IS NULL OR length(utm_campaign) <= 100)
  AND (ref IS NULL OR length(ref) <= 200));
CREATE POLICY "Admins can view region lookups" ON public.region_lookups
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
));

-- =============================================================
-- 3. Privacy-friendly analytics events (cookieless, no PII)
-- =============================================================
CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event text NOT NULL,
  role text,
  path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT ALL ON public.analytics_events TO service_role;
GRANT SELECT ON public.analytics_events TO authenticated;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log an analytics event" ON public.analytics_events
FOR INSERT TO anon, authenticated
WITH CHECK (event IN ('page_view','region_lookup','form_start','form_submit')
  AND (role IS NULL OR length(role) <= 40)
  AND (path IS NULL OR length(path) <= 200));
CREATE POLICY "Admins can view analytics events" ON public.analytics_events
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
));
