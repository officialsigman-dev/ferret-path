import { getRequest } from "@tanstack/react-start/server";
import { sendLovableEmail } from "@lovable.dev/email-js";

function siteOrigin(): string {
  try {
    const request = getRequest();
    if (request?.url) return new URL(request.url).origin;
  } catch {
    // no request context (e.g. build) — fall through
  }
  return process.env['SITE_URL'] ?? "https://ferret.lovable.app";
}

export function confirmUrlFor(token: string): string {
  return `${siteOrigin()}/confirm?token=${encodeURIComponent(token)}`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

/**
 * Sends the waitlist confirmation email. Returns false (without throwing) when
 * email sending isn't configured yet, so signups are never lost.
 */
export async function sendConfirmationEmail(
  to: string,
  fullName: string,
  confirmUrl: string,
): Promise<boolean> {
  const apiKey = process.env['LOVABLE_API_KEY'];
  const senderDomain = process.env['LOVABLE_EMAIL_SENDER_DOMAIN'];

  if (!apiKey || !senderDomain) {
    console.warn("[signups] confirmation email skipped — email sending is not configured yet");
    return false;
  }

  const name = escapeHtml(fullName.split(" ")[0] ?? "there");
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;background:#ffffff;padding:32px;color:#2B2320">
      <h1 style="font-size:24px;margin:0 0 12px">Confirm your spot on the ferret waitlist</h1>
      <p style="margin:0 0 16px">Hi ${name}, tap the button below to confirm your email address. That's all we need.</p>
      <p style="margin:0 0 24px">
        <a href="${confirmUrl}" style="background:#FF6B4A;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:600;display:inline-block">Confirm my email</a>
      </p>
      <p style="margin:0;font-size:13px;color:#6b6360">If the button doesn't work, paste this link into your browser:<br>${escapeHtml(confirmUrl)}</p>
      <p style="margin:24px 0 0;font-size:13px;color:#6b6360">Didn't sign up? You can ignore this email.</p>
    </div>`;

  const text = `Hi ${fullName.split(" ")[0] ?? "there"},\n\nConfirm your spot on the ferret waitlist:\n${confirmUrl}\n\nDidn't sign up? Ignore this email.`;

  try {
    await sendLovableEmail(
      {
        to,
        from: `ferret <noreply@${senderDomain}>`,
        sender_domain: senderDomain,
        subject: "Confirm your ferret waitlist signup",
        html,
        text,
        purpose: "waitlist_confirmation",
      },
      { apiKey },
    );
    return true;
  } catch (error) {
    console.error("[signups] confirmation email failed", error);
    return false;
  }
}
