import type { SignupInput } from "@/lib/signup-schema";
import { getSupabasePublic } from "./supabase-public.server";

type SignupResult =
  | { kind: "created"; id: string; confirmationToken: string; parentToken: string }
  | { kind: "duplicate" }
  | { kind: "error"; message: string };

function createToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function insertSignup(data: SignupInput): Promise<SignupResult> {
  const confirmationToken = createToken();
  const parentToken = data.role === "teen_14_17" ? createToken() : null;
  const supabasePublic = getSupabasePublic();
  if (!supabasePublic) {
    return { kind: "error", message: "Database configuration is unavailable" };
  }

  const { data: row, error } = await supabasePublic
    .from("signups")
    .insert({
      full_name: data.fullName,
      email: data.email,
      role: data.role,
      county: data.county,
      zip: data.zip,
      grade: data.grade ?? null,
      interest: data.interest ?? null,
      company: data.company ?? null,
      industry: data.industry ?? null,
      parent_email: data.parentEmail ?? null,
      utm_source: data.utmSource ?? null,
      utm_medium: data.utmMedium ?? null,
      utm_campaign: data.utmCampaign ?? null,
      ref: data.ref ?? null,
      message: data.message ?? null,
      confirmation_token: confirmationToken,
      parent_token: parentToken,
    })
    .select("id")
    .single();

  if (!error && row) {
    return {
      kind: "created",
      id: row.id,
      confirmationToken,
      parentToken: parentToken ?? "",
    };
  }
  if (error?.code === "23505") return { kind: "duplicate" };
  console.error("[signups] public database insert failed", error?.code, error?.message);
  return { kind: "error", message: error?.message ?? "unknown error" };
}

export async function markConfirmationSent(id: string): Promise<void> {
  if (!id) return;
}
