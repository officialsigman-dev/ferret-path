import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }
    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

/**
 * Same contract as the generated requireSupabaseAuth, but falls back to the
 * build-time inlined VITE_* values so it also works in the published Worker,
 * where process.env may not carry SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY.
 */
export const requireAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const url = process.env["SUPABASE_URL"] || import.meta.env.VITE_SUPABASE_URL;
  const publishableKey =
    process.env["SUPABASE_PUBLISHABLE_KEY"] || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Database configuration is unavailable");
  }

  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized: missing bearer token");
  }
  const token = authHeader.slice("Bearer ".length);
  if (token.split(".").length !== 3) {
    throw new Error("Unauthorized: invalid token");
  }

  const supabase = createClient<Database>(url, publishableKey, {
    global: {
      fetch: createSupabaseFetch(publishableKey),
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    throw new Error("Unauthorized: invalid token");
  }

  return next({
    context: { supabase, userId: data.claims.sub as string, claims: data.claims },
  });
});
