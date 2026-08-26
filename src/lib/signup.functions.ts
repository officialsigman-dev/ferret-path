import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const submitSignup = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({
    fullName: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(255),
    city: z.string().trim().min(1).max(100),
    message: z.string().trim().min(1).max(1000),
  }).parse(data))
  .handler(async ({ data }) => {
    const { sendConfirmationEmail, confirmUrlFor } = await import("./signup-email.server");
    const { insertSignup, markConfirmationSent } = await import("./signup-data.server");

    const email = data.email.toLowerCase();
    const result = await insertSignup({ ...data, email });
    if (result.kind === "duplicate") return { status: "already_confirmed" as const };
    if (result.kind === "error") {
      throw new Error("Could not save your signup.");
    }

    const sent = await sendConfirmationEmail(
      email,
      data.fullName,
      confirmUrlFor(result.confirmationToken),
    );
    if (sent) await markConfirmationSent(result.id);

    return { status: "sent" as const };
  });

export const confirmSignup = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({
    token: z.string().trim().min(16).max(128),
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("signups")
      .select("id, full_name, confirmed_at")
      .eq("confirmation_token", data.token)
      .maybeSingle();

    if (error) throw new Error("Could not confirm your email.");
    if (!row) return { status: "invalid" as const };
    if (row.confirmed_at) return { status: "already" as const, name: row.full_name };

    const { error: updateError } = await supabaseAdmin
      .from("signups")
      .update({ confirmed_at: new Date().toISOString() })
      .eq("id", row.id);

    if (updateError) throw new Error("Could not confirm your email.");
    return { status: "confirmed" as const, name: row.full_name };
  });
