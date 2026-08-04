import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const submitSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  city: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1).max(1000),
});

const confirmSchema = z.object({
  token: z.string().trim().min(16).max(128),
});

export const submitSignup = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendConfirmationEmail, confirmUrlFor } = await import("./signup-email.server");

    const email = data.email.toLowerCase();

    const { data: row, error } = await supabaseAdmin
      .from("signups")
      .insert({
        full_name: data.fullName,
        email,
        city: data.city,
        message: data.message,
      })
      .select("id, confirmation_token, confirmed_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        // Already on the list — resend the confirmation link if still unconfirmed.
        const { data: existing } = await supabaseAdmin
          .from("signups")
          .select("id, confirmation_token, confirmed_at")
          .eq("email", email)
          .maybeSingle();

        if (existing && !existing.confirmed_at) {
          await sendConfirmationEmail(email, data.fullName, confirmUrlFor(existing.confirmation_token));
          await supabaseAdmin
            .from("signups")
            .update({ confirmation_sent_at: new Date().toISOString() })
            .eq("id", existing.id);
          return { status: "resent" as const };
        }
        return { status: "already_confirmed" as const };
      }
      throw new Error("Could not save your signup.");
    }

    await sendConfirmationEmail(email, data.fullName, confirmUrlFor(row.confirmation_token));
    await supabaseAdmin
      .from("signups")
      .update({ confirmation_sent_at: new Date().toISOString() })
      .eq("id", row.id);

    return { status: "sent" as const };
  });

export const confirmSignup = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => confirmSchema.parse(data))
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
