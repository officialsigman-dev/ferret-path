import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { confirmSignup } from "@/lib/signup.functions";


export const Route = createFileRoute("/confirm")({
  head: () => ({
    meta: [
      { title: "Confirm your email — ferret" },
      {
        name: "description",
        content: "Confirm your email address to secure your spot on the ferret waitlist.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Confirm your email — ferret" },
      {
        property: "og:description",
        content: "Confirm your email address to secure your spot on the ferret waitlist.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfirmPage,
});

type State =
  | { kind: "loading" }
  | { kind: "confirmed" | "already"; name: string }
  | { kind: "invalid" | "error" };

function ConfirmPage() {
  const confirm = useServerFn(confirmSignup);
  const [state, setState] = useState<State>({ kind: "loading" });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const token = new URLSearchParams(window.location.search).get("token") ?? "";
    if (!token) return setState({ kind: "invalid" });
    confirm({ data: { token } })
      .then((result) => {
        if (result.status === "invalid") return setState({ kind: "invalid" });
        setState({ kind: result.status, name: result.name });
      })
      .catch(() => setState({ kind: "error" }));
  }, [confirm]);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-16">
      <div className="w-full max-w-md rounded-4xl border border-border bg-card p-8 text-center">
        <img
          src="/ferret-icon.png"
          alt="ferret logo"
          width={48}
          height={48}
          className="mx-auto size-12 rounded-xl"
        />

        {state.kind === "loading" && (
          <>
            <Loader2 className="mx-auto mt-6 size-7 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Confirming your email…</p>
          </>
        )}

        {(state.kind === "confirmed" || state.kind === "already") && (
          <>
            <span className="mx-auto mt-6 grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Check className="size-7" strokeWidth={3} />
            </span>
            <h1 className="mt-6 text-2xl">
              {state.kind === "confirmed" ? "Email confirmed" : "Already confirmed"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Thanks{state.name ? `, ${state.name.split(" ")[0]}` : ""} — your spot on the ferret
              waitlist is secured. We'll be in touch.
            </p>
          </>
        )}

        {(state.kind === "invalid" || state.kind === "error") && (
          <>
            <span className="mx-auto mt-6 grid size-14 place-items-center rounded-2xl bg-muted text-foreground">
              <X className="size-7" strokeWidth={3} />
            </span>
            <h1 className="mt-6 text-2xl">
              {state.kind === "invalid" ? "Link not valid" : "Something went wrong"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {state.kind === "invalid"
                ? "This confirmation link is invalid or has already been replaced. Try signing up again."
                : "We couldn't confirm your email just now. Please try the link again in a moment."}
            </p>
          </>
        )}

        <Link
          to="/"
          className="mt-8 inline-block text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          ← back to ferret
        </Link>
      </div>
    </main>
  );
}
