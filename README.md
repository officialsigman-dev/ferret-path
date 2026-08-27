# FERRET | Teen Apprenticeships in Manitoba 

Build a single-page landing site for FERRET, an apprenticeship marketplace 

that connects teens aged 14–18 in Manitoba with local apprenticeship and 

skills-based opportunities. This is a pre-launch validation page — the only 

goal is to collect signups and gauge interest, so keep it simple and fast.

BRAND

- Name: ferret (always lowercase in the wordmark)

- Tagline: "apprenticeships for teens, 14–18"

- Personality: energetic, credible, optimistic — NOT childish or cartoonish. 

  Think "a brand a 16-year-old and their parent would both trust."

- Colors: coral (#FF6B4A) as the primary accent, cream (#FFF3E6) as the 

  background, dark charcoal (#2B2320) for text and contrast elements

- Typography: bold, confident sans-serif for headlines; clean and readable 

  for body text. Generous whitespace. Rounded corners on cards/buttons to 

  echo the logo's rounded-square mark.

- No stock photos of generic "business people." If using imagery, keep it 

  abstract/illustrative or skip imagery entirely in favor of strong 

  typography and color blocking.

PAGE STRUCTURE (single page, mobile-first, fully responsive)

1. HERO

   - Logo/wordmark top-left

   - Headline: something like "Real skills. Real experience. Before you 

     graduate." (feel free to propose 2-3 alternatives in the code comments)

   - Subheadline: one sentence explaining what FERRET does and that it's 

     launching in Manitoba

   - Primary CTA button ("Join the waitlist") that smooth-scrolls to the 

     signup form

2. VALUE PROP (3 short bullets or cards, icon + one line each)

   - For teens: discover real apprenticeship opportunities near you

   - For families: a safe, credible way to explore career paths early

   - For employers/partners: connect with motivated young talent

   (Keep this section short — this is a validation page, not a full 

   marketing site)

3. SIGNUP FORM (this is the core conversion element — keep it front and 

   center, not buried)

   Fields, ALL REQUIRED:

   - Full Name (text input)

   - Email (email input, validated format)

   - City/Town in Manitoba (text input — used to gauge geographic demand)

   - "Tell us why you're interested" (textarea, short — placeholder like 

     "e.g. I'm a parent looking for opportunities for my teen" or "I'm 16 

     and want hands-on experience in trades")

   

   Validation: all fields required, inline error messages, email format 

   checked before submit. Disable submit button until valid.

   

   On submit: store the entry in a Supabase table called "signups" with 

   columns full_name, email, city, message, created_at. Show a clean 

   success state (checkmark + "You're on the list — we'll be in touch") 

   in place of the form, not a popup.

4. FOOTER

   - Small wordmark or monochrome mark

   - Simple line: "FERRET is currently in development in Manitoba, Canada."

   - No fake social links, no fake press logos — this is a validation page, 

     keep it honest and minimal

TECHNICAL

- Single page, no routing needed

- Connect Supabase for form storage

- Fully responsive, mobile-first (most teens will find this via a phone)

- Fast load, minimal dependencies, no unnecessary animation libraries — 

  subtle micro-interactions (button hover, form focus states) are fine

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ferret-path.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/71175cba-1cda-49c7-9eef-489a2095224e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
