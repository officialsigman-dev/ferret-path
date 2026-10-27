import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { WISCONSIN_ZIP_RE } from "./wisconsin";
import { getSupabasePublic } from "./supabase-public.server";

export const logRegionLookup = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        zip: z.string().trim().regex(WISCONSIN_ZIP_RE),
        utmSource: z.string().max(100).optional().nullable(),
        utmMedium: z.string().max(100).optional().nullable(),
        utmCampaign: z.string().max(100).optional().nullable(),
        ref: z.string().max(200).optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const supabasePublic = getSupabasePublic();
    if (!supabasePublic) return { ok: false };

    const { error } = await supabasePublic.from("region_lookups").insert({
      zip: data.zip,
      utm_source: data.utmSource ?? null,
      utm_medium: data.utmMedium ?? null,
      utm_campaign: data.utmCampaign ?? null,
      ref: data.ref ?? null,
    });

    if (error) {
      console.error("[region] lookup log failed", error.code, error.message);
      return { ok: false };
    }
    return { ok: true };
  });
