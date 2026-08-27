import { createFileRoute, Link } from "@tanstack/react-router";


export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ferret waitlist data & your rights" },
      {
        name: "description",
        content:
          "How ferret collects, uses, stores and deletes waitlist signup information, plus your rights under Canadian privacy law (PIPEDA).",
      },
      { property: "og:title", content: "Privacy Policy — ferret" },
      {
        property: "og:description",
        content:
          "How ferret collects, uses, stores and deletes waitlist signup information, plus your PIPEDA rights.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://ferret.traxform.co/privacy" }],
  }),
  component: Privacy,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}

function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-2">
          <img
            src={ferretIcon.url}
            alt="ferret logo"
            width={48}
            height={48}
            className="size-12 rounded-xl"
          />
          <span className="wordmark text-2xl">ferret</span>
        </Link>
        <Link
          to="/"
          className="rounded-full border border-foreground/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          Back to home
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20 sm:px-8">
        <h1 className="mt-6 text-4xl sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: August 24, 2026</p>
        <p className="mt-6 text-muted-foreground">
          ferret (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), a project by{" "}
          <a
            href="https://traxform.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Traxform
          </a>
          , operates this landing page. This policy explains how we collect, use, and protect your
          information during our early market validation phase.
        </p>

        <Section title="1. Information we collect">
          <p>We only collect personal information you voluntarily provide:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Your name, email address, city or town, and the note you write us at signup</li>
            <li>Basic interaction data (via analytics cookies, if applicable)</li>
          </ul>
        </Section>

        <Section title="2. How we use your information">
          <ul className="list-disc space-y-1 pl-5">
            <li>Confirm your email address so only valid signups are counted</li>
            <li>Send you updates regarding the launch of ferret</li>
            <li>Invite you to beta testing or feedback surveys</li>
            <li>Gauge market interest in our minimum viable product</li>
          </ul>
          <p>We will never sell, rent, or lease your personal data to third parties.</p>
        </Section>

        <Section title="3. Data storage and security">
          <p>
            Your data is securely stored through our hosting and database partners (Lovable /
            Supabase). We retain your information only as long as necessary to validate this startup
            concept, or until you request its removal.
          </p>
        </Section>

        <Section title="4. Your rights (PIPEDA & Canadian privacy compliance)">
          <ul className="list-disc space-y-1 pl-5">
            <li>Access the personal data we hold about you</li>
            <li>Request that we correct any inaccurate information</li>
            <li>Withdraw your consent and request immediate deletion from our waitlist</li>
          </ul>
        </Section>

        <Section title="5. Contact us">
          <p>
            Questions, or want your data removed? Email{" "}
            <a
              href="mailto:info@traxform.co"
              className="underline underline-offset-2 hover:text-foreground"
            >
              info@traxform.co
            </a>
            .
          </p>
        </Section>
      </main>
    </div>
  );
}
