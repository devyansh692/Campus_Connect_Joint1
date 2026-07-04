import nodemailer from "nodemailer";

// Works with any SMTP provider: Gmail (app password), SendGrid, Mailgun,
// Amazon SES SMTP, Resend SMTP, Brevo, etc. — just set the env vars below.
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for 587/25
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  const appName = process.env.APP_NAME ?? "Campus Connect";

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? `"${appName}" <no-reply@campusconnect.app>`,
    to,
    subject: `${otp} is your ${appName} password reset code`,
    text: `Your ${appName} password reset code is ${otp}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#0A66C2; margin-bottom: 4px;">${appName}</h2>
        <p style="color:#1D2226; font-size: 15px;">Use the code below to reset your password. It expires in 10 minutes.</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background:#EAF3FE; color:#0A66C2; padding: 16px 24px; border-radius: 8px; text-align: center; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color:#56687A; font-size: 13px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}