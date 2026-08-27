# Fix broken ferret logo on published site

## Problem
The header and footer wordmarks show broken-image placeholders on the live site (`https://ferret.traxform.co/`). This happens because the logo is loaded from a Lovable sandbox asset path (`/__l5e/assets-v1/...`) that is not available on the published custom domain.

## What I will do
1. **Serve the logo as a real static file**
   - Use the existing `public/favicon.png` (same ferret icon) or copy it to `public/ferret-icon.png` so it is bundled and served from the published domain root.
2. **Update logo references in the landing page**
   - In `src/routes/index.tsx`, replace the Lovable asset-JSON import (`@/assets/ferret-icon.png.asset.json`) with a direct `/ferret-icon.png` (or `/favicon.png`) static path in both the header `Wordmark` and the footer logo.
3. **Align published-domain metadata**
   - Update `og:url` and canonical link in `src/routes/index.tsx` from the old `ferret-pathways-connect.lovable.app` slug to `https://ferret.traxform.co/`.
   - Update the same in `src/routes/__root.tsx` (and `src/routes/privacy.tsx` if it still references the old slug).
4. **Verify**
   - Check the local preview shows the logo correctly.
   - Confirm no broken-image placeholders remain after republishing.

## Outcome
The ferret logo will render reliably on both preview and the live `ferret.traxform.co` domain, and the page metadata will match the custom domain.
