import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabasePublic } from "./supabase-public.server";

const EVENT_NAMES = ["page_view", "region_lookup", "form_start", "form_submit"] as const;

/**
 * Privacy-friendly, cookieless event logging: no personal identifiers are
 * stored — only the event name, an optional role category, and the path.
 */
export const logAnalyticsEvent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        event: z.enum(EVENT_NAMES),
        role: z.string().max(40).optional().nullable(),
        path: z.string().max(200).optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const supabasePublic = getSupabasePublic();
    if (!supabasePublic) return { ok: false };

    const { error } = await supabasePublic.from("analytics_events").insert({
      event: data.event,
      role: data.role ?? null,
      path: data.path ?? null,
    });

    if (error) {
      console.error("[analytics] event log failed", error.code, error.message);
      return { ok: false };
    }
    return { ok: true };
  });
