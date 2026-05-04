import nodemailer from "nodemailer";
import { fmtNum } from "./utils";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const FROM = process.env.SMTP_FROM ?? "Remont.kz <noreply@remont.kz>";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

async function send(to: string, subject: string, html: string, text: string): Promise<void> {
  const t = createTransport();
  if (!t) {
    console.log(`\n[EMAIL] ${subject}\nTo: ${to}\n${text}\n`);
    return;
  }
  await t.sendMail({ from: FROM, to, subject, html, text });
}

function btn(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">${label}</a>`;
}

function layout(title: string, body: string) {
  return `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px">
    <p style="font-size:20px;font-weight:700;color:#1e293b;margin-bottom:4px">${title}</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">
    ${body}
    <p style="color:#94a3b8;font-size:12px;margin-top:32px">— Remont.kz · <a href="${BASE}" style="color:#3b82f6">remont.kz</a></p>
  </div>`;
}

/* ── Verify email ── */
export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  const html = layout("Verify your email", `
    <p style="color:#475569">Thanks for signing up! Click the button below to verify your email address.</p>
    ${btn(verifyUrl, "Verify Email")}
    <p style="color:#94a3b8;font-size:13px">Link expires in 24 hours. If you didn't sign up, ignore this.</p>
  `);
  await send(to, "Verify your Remont.kz email", html, `Verify your email: ${verifyUrl}`);
}

/* ── Password reset ── */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const html = layout("Reset your password", `
    <p style="color:#475569">You requested a password reset for your Remont.kz account.</p>
    ${btn(resetUrl, "Reset Password")}
    <p style="color:#94a3b8;font-size:13px">Valid for 1 hour. If you didn't request this, ignore this email.</p>
  `);
  await send(to, "Reset your Remont.kz password", html, `Reset link: ${resetUrl}`);
}

/* ── Welcome ── */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const html = layout(`Welcome to Remont.kz, ${name || "there"}!`, `
    <p style="color:#475569">Your account is ready. Browse services, submit requests, and connect with verified contractors across Kazakhstan.</p>
    ${btn(`${BASE}/repair`, "Browse Services")}
  `);
  await send(to, "Welcome to Remont.kz!", html, `Welcome! Start at ${BASE}/repair`);
}

/* ── New offer received (client) ── */
export async function sendNewOfferEmail(to: string, clientName: string, companyName: string, price: number, requestHref: string): Promise<void> {
  const html = layout("You received a new offer!", `
    <p style="color:#475569">Hi ${clientName || "there"}, <strong>${companyName}</strong> has sent you an offer for <strong>${fmtNum(price)} ₸</strong>.</p>
    ${btn(`${BASE}${requestHref}`, "View Offer")}
  `);
  await send(to, `New offer from ${companyName}`, html, `${companyName} offered ${fmtNum(price)} ₸. View: ${BASE}${requestHref}`);
}

/* ── Request accepted (client) ── */
export async function sendRequestAcceptedEmail(to: string, clientName: string, companyName: string, chatHref: string): Promise<void> {
  const html = layout("Your request was accepted!", `
    <p style="color:#475569">Hi ${clientName || "there"}, <strong>${companyName}</strong> has accepted your request and is ready to start.</p>
    ${btn(`${BASE}${chatHref}`, "Open Chat")}
  `);
  await send(to, `${companyName} accepted your request`, html, `${companyName} accepted. Chat: ${BASE}${chatHref}`);
}

/* ── New request available (company) ── */
export async function sendNewRequestEmail(to: string, companyName: string, category: string, city: string, dashboardHref: string): Promise<void> {
  const html = layout("New request matching your services!", `
    <p style="color:#475569">Hi ${companyName || "there"}, a new client request in <strong>${category}</strong> near <strong>${city}</strong> is waiting for offers.</p>
    ${btn(`${BASE}${dashboardHref}`, "View Request")}
  `);
  await send(to, "New request — make an offer", html, `New request in ${category}, ${city}. View: ${BASE}${dashboardHref}`);
}

/* ── Job completed — leave review (client) ── */
export async function sendJobCompletedEmail(to: string, clientName: string, companyName: string, requestHref: string): Promise<void> {
  const html = layout("Job completed — share your experience!", `
    <p style="color:#475569">Hi ${clientName || "there"}, the job with <strong>${companyName}</strong> has been completed. Take a moment to leave a review.</p>
    ${btn(`${BASE}${requestHref}`, "Leave a Review")}
  `);
  await send(to, "How was the job? Leave a review", html, `Leave a review for ${companyName}: ${BASE}${requestHref}`);
}

