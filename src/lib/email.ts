import nodemailer from "nodemailer";

const FROM = process.env.FROM_EMAIL || "noreply@axxes.club";

export const emailConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = emailConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export async function sendPasswordResetEmail(email: string, url: string) {
  if (!transporter) {
    console.error("[handshake] SMTP is not configured; password reset email not sent to", email);
    return;
  }
  await transporter.sendMail({
    from: `AXXES <${FROM}>`,
    to: email,
    subject: "Reset your AXXES password",
    text: `Reset your AXXES password: ${url}\n\nThis link expires in 1 hour. If you didn't ask for this, ignore this email.`,
    html: `<!doctype html><html><body style="margin:0;padding:40px 16px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
      <div style="max-width:460px;margin:0 auto;background:#fff;border-radius:16px;padding:32px">
        <p style="margin:0 0 24px;font-weight:600;font-size:18px">AXXES</p>
        <h1 style="margin:0 0 12px;font-size:20px">Reset your password</h1>
        <p style="margin:0 0 24px;color:#52525b;line-height:1.5">Use the button below to choose a new password for your AXXES account. The link expires in 1 hour.</p>
        <a href="${url}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:500">Choose a new password</a>
        <p style="margin:24px 0 0;color:#a1a1aa;font-size:13px">If you didn't ask for this, you can ignore this email.</p>
      </div></body></html>`,
  });
}
