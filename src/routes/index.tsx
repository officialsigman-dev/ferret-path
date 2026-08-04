import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Compass, ShieldCheck, Hammer, Check, MailCheck } from "lucide-react";
import { submitSignup } from "@/lib/signup.functions";
import ferretIcon from "@/assets/ferret-icon.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ferret — apprenticeships for Manitoba teens, 14–18" },
      {
        name: "description",
        content:
          "Join the ferret waitlist: real apprenticeships and skills-based opportunities for Manitoba teens aged 14–18. Launching soon.",
      },
      { property: "og:title", content: "ferret — apprenticeships for Manitoba teens, 14–18" },
      {
        property: "og:description",
        content:
          "Join the ferret waitlist: real apprenticeships and skills-based opportunities for Manitoba teens aged 14–18.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/*
 * Headline alternatives considered:
 * 1. "Real skills. Real experience. Before you graduate."  <- in use
 * 2. "Skip the resume gap. Start building at 14."
 * 3. "Manitoba's trades are hiring. You're old enough to start."
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Field = "fullName" | "email" | "city" | "message";

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={ferretIcon.url}
        alt="ferret logo"
        width={40}
        height={40}
        className="size-9 rounded-xl sm:size-10"
      />
      <span className="wordmark text-2xl">ferret</span>
    </span>
  );
}

function Index() {
  const [values, setValues] = useState({ fullName: "", email: "", city: "", message: "" });
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    fullName: false,
    email: false,
    city: false,
    message: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [outcome, setOutcome] = useState<"sent" | "resent" | "already_confirmed">("sent");
  const [formError, setFormError] = useState<string | null>(null);
  const submit = useServerFn(submitSignup);

  const errors = useMemo(() => {
    const e: Partial<Record<Field, string>> = {};
    if (!values.fullName.trim()) e.fullName = "Please enter your full name.";
    else if (values.fullName.trim().length > 100) e.fullName = "Keep this under 100 characters.";
    if (!values.email.trim()) e.email = "Please enter your email.";
    else if (!EMAIL_RE.test(values.email.trim())) e.email = "That doesn't look like a valid email.";
    if (!values.city.trim()) e.city = "Please tell us your city or town.";
    if (!values.message.trim()) e.message = "A sentence or two is plenty.";
    else if (values.message.trim().length > 1000) e.message = "Keep this under 1000 characters.";
    return e;
  }, [values]);

  const isValid = Object.keys(errors).length === 0;

  const set = (field: Field, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));
  const blur = (field: Field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const showError = (field: Field) => (touched[field] ? errors[field] : undefined);

  const inputClass = (field: Field) =>
    `w-full rounded-xl border bg-background px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15 ${
      showError(field) ? "border-destructive" : "border-border"
    }`;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const result = await submit({
        data: {
          fullName: values.fullName.trim(),
          email: values.email.trim().toLowerCase(),
          city: values.city.trim(),
          message: values.message.trim(),
        },
      });
      setSubmitting(false);
      setOutcome(result.status);
      setSubmitted(true);
    } catch {
      setSubmitting(false);
      setFormError("Something went wrong saving your spot. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
        <Wordmark />
        <a
          href="#waitlist"
          className="hidden rounded-full border border-foreground/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent sm:inline-block"
        >
          Join the waitlist
        </a>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-5 pt-8 pb-16 sm:px-8 sm:pt-16 sm:pb-24">
          <p className="wordmark text-sm tracking-normal text-primary sm:text-base">
            apprenticeships for teens, 14–18
          </p>
          <h1 className="mt-4 max-w-3xl text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl">
            Real skills.
            <br />
            Real experience.
            <br />
            <span className="text-primary">Before you graduate.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            ferret connects Manitoba teens with local apprenticeships and hands-on,
            skills-based opportunities — launching first across Manitoba.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#waitlist"
              className="rounded-2xl bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-[0_8px_0_0_var(--charcoal)] transition-all hover:translate-y-0.5 hover:shadow-[0_5px_0_0_var(--charcoal)] active:translate-y-2 active:shadow-none"
            >
              Join the waitlist
            </a>
            <span className="text-sm text-muted-foreground">Free · Takes 30 seconds</span>
          </div>
        </section>

        {/* VALUE PROP */}
        <section className="bg-secondary py-16 text-secondary-foreground sm:py-20">
          <div className="mx-auto grid max-w-5xl gap-5 px-5 sm:grid-cols-3 sm:px-8">
            {[
              {
                icon: Compass,
                title: "For teens",
                line: "Discover real apprenticeship opportunities near you.",
              },
              {
                icon: ShieldCheck,
                title: "For families",
                line: "A safe, credible way to explore career paths early.",
              },
              {
                icon: Hammer,
                title: "For employers",
                line: "Connect with motivated young talent in your community.",
              },
            ].map(({ icon: Icon, title, line }) => (
              <div
                key={title}
                className="rounded-3xl border border-secondary-foreground/10 bg-secondary-foreground/5 p-6"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <Icon className="size-5" strokeWidth={2.4} />
                </span>
                <h2 className="mt-5 text-xl">{title}</h2>
                <p className="mt-2 text-sm text-secondary-foreground/70">{line}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SIGNUP */}
        <section id="waitlist" className="scroll-mt-8 px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-xl rounded-4xl border border-border bg-card p-6 shadow-[0_2px_0_0_var(--border)] sm:p-9">
            {submitted ? (
              <div className="py-10 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  {outcome === "already_confirmed" ? (
                    <Check className="size-7" strokeWidth={3} />
                  ) : (
                    <MailCheck className="size-7" strokeWidth={2.5} />
                  )}
                </span>
                <h2 className="mt-6 text-2xl">
                  {outcome === "already_confirmed" ? "You're already on the list" : "Check your email"}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {outcome === "already_confirmed"
                    ? "That email is confirmed and on the waitlist — we'll be in touch."
                    : `We sent a confirmation link to ${values.email.trim().toLowerCase()}. Click it to secure your spot — only confirmed emails are counted.`}
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-3xl sm:text-4xl">Join the waitlist</h2>
                <p className="mt-2 text-muted-foreground">
                  Be first to know when ferret opens in your community.
                </p>
                <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                  <div>
                    <label htmlFor="fullName" className="mb-1.5 block text-sm font-semibold">
                      Full name
                    </label>
                    <input
                      id="fullName"
                      value={values.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                      onBlur={() => blur("fullName")}
                      maxLength={100}
                      placeholder="Jordan Bellefeuille"
                      className={inputClass("fullName")}
                    />
                    {showError("fullName") && (
                      <p className="mt-1.5 text-sm text-destructive">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      inputMode="email"
                      value={values.email}
                      onChange={(e) => set("email", e.target.value)}
                      onBlur={() => blur("email")}
                      maxLength={255}
                      placeholder="you@example.com"
                      className={inputClass("email")}
                    />
                    {showError("email") && (
                      <p className="mt-1.5 text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="city" className="mb-1.5 block text-sm font-semibold">
                      City or town in Manitoba
                    </label>
                    <input
                      id="city"
                      value={values.city}
                      onChange={(e) => set("city", e.target.value)}
                      onBlur={() => blur("city")}
                      maxLength={100}
                      placeholder="Winnipeg"
                      className={inputClass("city")}
                    />
                    {showError("city") && (
                      <p className="mt-1.5 text-sm text-destructive">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-sm font-semibold">
                      Tell us why you're interested
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      value={values.message}
                      onChange={(e) => set("message", e.target.value)}
                      onBlur={() => blur("message")}
                      maxLength={1000}
                      placeholder="e.g. I'm 16 and want hands-on experience in trades"
                      className={`${inputClass("message")} resize-none`}
                    />
                    {showError("message") && (
                      <p className="mt-1.5 text-sm text-destructive">{errors.message}</p>
                    )}
                  </div>

                  {formError && <p className="text-sm text-destructive">{formError}</p>}

                  <button
                    type="submit"
                    disabled={!isValid || submitting}
                    className="w-full rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {submitting ? "Saving your spot…" : "Join the waitlist"}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-3">
          <span className="inline-flex items-center gap-2">
            <img src={ferretIcon.url} alt="ferret logo" width={28} height={28} className="size-7 rounded-lg" />
            <span className="wordmark text-xl text-muted-foreground">ferret</span>
          </span>
          <p className="text-sm text-muted-foreground">
            FERRET is currently in development in Manitoba, Canada.
          </p>
        </div>
      </footer>
    </div>
  );
}
