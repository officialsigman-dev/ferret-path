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
  const url = process.env['SUPABASE_URL'];
  const publishableKey = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !publishableKey) {
    console.error("[signups] public database configuration is unavailable");
    return { kind: "error", message: "Database configuration is unavailable" };
  }

  const supabasePublic = createClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
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