import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { signupSchema } from "./signup-schema";

export const submitSignup = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => signupSchema.parse(data))
  .handler(async ({ data }) => {
    const { sendConfirmationEmail, sendParentConfirmationEmail, confirmUrlFor, parentConfirmUrlFor } =
      await import("./signup-email.server");
    const { insertSignup, markConfirmationSent } = await import("./signup-data.server");

    const email = data.email.toLowerCase();
    const parentEmail = data.parentEmail ? data.parentEmail.trim().toLowerCase() : null;
    const result = await insertSignup({
      ...data,
      email,
      parentEmail: parentEmail || null,
    });
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

    if (data.role === "teen_14_17" && parentEmail) {
      await sendParentConfirmationEmail(
        parentEmail,
        data.fullName,
        parentConfirmUrlFor(result.parentToken),
      );
    }

    return { status: "sent" as const };
  });

export const confirmSignup = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        token: z.string().trim().min(16).max(128),
        parent: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.parent) {
      const { data: row, error } = await supabaseAdmin
        .from("signups")
        .select("id, full_name, parent_confirmed_at")
        .eq("parent_token", data.token)
        .maybeSingle();

      if (error) throw new Error("Could not confirm the parent email.");
      if (!row) return { status: "invalid" as const };
      if (row.parent_confirmed_at) return { status: "already" as const, name: row.full_name };

      const { error: updateError } = await supabaseAdmin
        .from("signups")
        .update({ parent_confirmed: true, parent_confirmed_at: new Date().toISOString() })
        .eq("id", row.id);

      if (updateError) throw new Error("Could not confirm the parent email.");
      return { status: "confirmed" as const, name: row.full_name };
    }

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
