import { getRequest } from "@tanstack/react-start/server";
import { sendLovableEmail } from "@lovable.dev/email-js";

function siteOrigin(): string {
  try {
    const request = getRequest();
    if (request?.url) return new URL(request.url).origin;
  } catch {
    // no request context (e.g. build) — fall through
  }
  return process.env["SITE_URL"] ?? "https://ferret.traxform.co";
}

export function confirmUrlFor(token: string): string {
  return `${siteOrigin()}/confirm?token=${encodeURIComponent(token)}`;
}

export function parentConfirmUrlFor(token: string): string {
  return `${siteOrigin()}/confirm?token=${encodeURIComponent(token)}&parent=1`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

function emailConfig(): { apiKey: string; senderDomain: string } | null {
  const apiKey = process.env["LOVABLE_API_KEY"];
  const senderDomain = process.env["LOVABLE_EMAIL_SENDER_DOMAIN"];
  if (!apiKey || !senderDomain) return null;
  return { apiKey, senderDomain };
}

function buttonHtml(label: string, url: string): string {
  return `<a href="${url}" style="background:#FF6B4A;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:600;display:inline-block">${label}</a>`;
}

function footerHtml(confirmUrl: string): string {
  return `<p style="margin:0;font-size:13px;color:#6b6360">If the button doesn't work, paste this link into your browser:<br>${escapeHtml(confirmUrl)}</p>`;
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
  const config = emailConfig();
  if (!config) {
    console.warn("[signups] confirmation email skipped — email sending is not configured yet");
    return false;
  }

  const name = escapeHtml(fullName.split(" ")[0] ?? "there");
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;background:#ffffff;padding:32px;color:#2B2320">
      <h1 style="font-size:24px;margin:0 0 12px">Confirm your spot on the ferret waitlist</h1>
      <p style="margin:0 0 16px">Hi ${name}, tap the button below to confirm your email address. That's all we need.</p>
      <p style="margin:0 0 24px">${buttonHtml("Confirm my email", confirmUrl)}</p>
      ${footerHtml(confirmUrl)}
      <p style="margin:24px 0 0;font-size:13px;color:#6b6360">Didn't sign up? You can ignore this email.</p>
    </div>`;

  const text = `Hi ${fullName.split(" ")[0] ?? "there"},\n\nConfirm your spot on the ferret waitlist:\n${confirmUrl}\n\nDidn't sign up? Ignore this email.`;

  try {
    await sendLovableEmail(
      {
        to,
        from: `ferret <noreply@${config.senderDomain}>`,
        sender_domain: config.senderDomain,
        subject: "Confirm your ferret waitlist signup",
        html,
        text,
        purpose: "waitlist_confirmation",
      },
      { apiKey: config.apiKey },
    );
    return true;
  } catch (error) {
    console.error("[signups] confirmation email failed", error);
    return false;
  }
}

/**
 * Sends the parent/guardian confirmation email for teen (14–17) signups.
 * The signup's spot isn't counted as parent-confirmed until they click.
 */
export async function sendParentConfirmationEmail(
  to: string,
  teenName: string,
  confirmUrl: string,
): Promise<boolean> {
  const config = emailConfig();
  if (!config) {
    console.warn("[signups] parent confirmation email skipped — email sending is not configured yet");
    return false;
  }

  const teenFirst = escapeHtml(teenName.split(" ")[0] ?? "your teen");
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;background:#ffffff;padding:32px;color:#2B2320">
      <h1 style="font-size:24px;margin:0 0 12px">Confirm ${teenFirst}'s ferret signup</h1>
      <p style="margin:0 0 16px">Hi there — ${teenFirst} joined the ferret waitlist for Wisconsin teens. Because they're under 18, we ask a parent or guardian to confirm. Tap the button below; it only confirms the signup and keeps you in the loop.</p>
      <p style="margin:0 0 24px">${buttonHtml("I'm the parent or guardian", confirmUrl)}</p>
      ${footerHtml(confirmUrl)}
      <p style="margin:24px 0 0;font-size:13px;color:#6b6360">Didn't expect this? You can ignore this email, or reply to ask us to remove ${teenFirst}'s info.</p>
    </div>`;

  const text = `Hi there — ${teenName.split(" ")[0] ?? "your teen"} joined the ferret waitlist. Because they're under 18, we ask a parent or guardian to confirm:\n${confirmUrl}\n\nDidn't expect this? Ignore this email or reply to ask us to remove their info.`;

  try {
    await sendLovableEmail(
      {
        to,
        from: `ferret <noreply@${config.senderDomain}>`,
        sender_domain: config.senderDomain,
        subject: "Confirm your teen's ferret waitlist signup",
        html,
        text,
        purpose: "waitlist_parent_confirmation",
      },
      { apiKey: config.apiKey },
    );
    return true;
  } catch (error) {
    console.error("[signups] parent confirmation email failed", error);
    return false;
  }
}
