# Connect ferret.traxform.co as the custom domain

## Goal
Point the published ferret landing page at `ferret.traxform.co` instead of the default `ferret-path.lovable.app` URL, and update the site so links/metadata match the new domain.

## What I will do in code
1. Audit `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/privacy.tsx`, and `src/lib/signup-email.server.ts` for hardcoded references to `ferret-path.lovable.app` or the old slug.
2. Replace hardcoded production URLs with the custom domain where appropriate (canonical tags, OG/Twitter metadata, sitemap generator, confirmation-email origin fallback, footer/privacy links).
3. Keep environment-aware fallbacks so preview builds and local dev still work.
4. Verify the sitemap and social meta tags reference `https://ferret.traxform.co/`.

## What you need to do in DNS / Lovable settings
1. In Lovable, go to **Project Settings → Project section → Domains** (or **Publish dialog → Add custom domain**).
2. Click **Connect Domain** and enter `ferret.traxform.co`.
3. At your DNS provider (wherever `traxform.co` is managed), add the records Lovable shows you:
   - **A record** for `ferret.traxform.co` pointing to `185.158.133.1`
   - **TXT record** for `_lovable.ferret.traxform.co` with the verification value Lovable provides
4. Wait for DNS propagation (up to 72 hours), then confirm the domain status is **Active** in Lovable.

## Email sender domain note
Do not use `ferret.traxform.co` for both the website and Lovable Emails at the same time — the two products need different DNS control (A/TXT for the site, NS delegation for email). If you also want branded confirmation emails, plan to use a separate subdomain such as `notify.traxform.co` or `email.traxform.co` for the sender domain.

## Verification
After DNS is active, I will confirm:
- `https://ferret.traxform.co/` loads the landing page.
- `https://ferret.traxform.co/sitemap.xml` returns valid URLs under the custom domain.
- The waitlist form still submits successfully (the previous sandbox error is already fixed).
