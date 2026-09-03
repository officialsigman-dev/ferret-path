import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type SignupInput = {
  fullName: string;
  email: string;
  city: string;
  message: string;
};

type SignupResult =
  | { kind: "created"; id: string; confirmationToken: string }
  | { kind: "duplicate" }
  | { kind: "error"; message: string };

function createConfirmationToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function insertSignup(data: SignupInput): Promise<SignupResult> {
  const confirmationToken = createConfirmationToken();
  // process.env is populated in the Lovable sandbox; the published Worker relies
  // on the build-time inlined VITE_* values, so fall back to those.
  const url = process.env['SUPABASE_URL'] || import.meta.env.VITE_SUPABASE_URL;
  const publishableKey =
    process.env['SUPABASE_PUBLISHABLE_KEY'] || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    console.error("[signups] public database configuration is unavailable");
    return { kind: "error", message: "Database configuration is unavailable" };
  }

  const supabasePublic = createClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (
          publishableKey.startsWith("sb_") &&
          headers.get("Authorization") === `Bearer ${publishableKey}`
        ) {
          headers.delete("Authorization");
        }
        headers.set("apikey", publishableKey);
        return fetch(input, { ...init, headers });
      },
    },
  });

  const { error } = await supabasePublic.from("signups").insert({
    full_name: data.fullName,
    email: data.email,
    city: data.city,
    message: data.message,
    confirmation_token: confirmationToken,
  });

  if (!error) return { kind: "created", id: "", confirmationToken };
  if (error.code === "23505") return { kind: "duplicate" };
  console.error("[signups] public database insert failed", error.code, error.message);
  return { kind: "error", message: error.message };
}

export async function markConfirmationSent(id: string): Promise<void> {
  if (!id) return;
}