import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type PublicClient = ReturnType<typeof createClient<Database>>;

let cached: PublicClient | null | undefined;

/**
 * Anonymous, insert-only public client for tables where RLS allows anonymous
 * inserts but no reads. process.env is populated in the Lovable sandbox; the
 * published Worker relies on the build-time inlined VITE_* values.
 */
export function getSupabasePublic(): PublicClient | null {
  if (cached !== undefined) return cached;

  const url = process.env["SUPABASE_URL"] || import.meta.env.VITE_SUPABASE_URL;
  const publishableKey =
    process.env["SUPABASE_PUBLISHABLE_KEY"] || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    console.error("[supabase] public database configuration is unavailable");
    cached = null;
    return null;
  }

  cached = createClient<Database>(url, publishableKey, {
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
  return cached;
}
