const nodemailer = require("nodemailer");

let cachedTransporter = null;

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error(
      "EMAIL_USER / EMAIL_APP_PASSWORD are not set. Generate a free Gmail App Password " +
        "(requires 2-Step Verification enabled) at https://myaccount.google.com/apppasswords " +
        "and add both to your .env file."
    );
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }

  return cachedTransporter;
}

async function sendPasswordResetEmail(to, resetUrl) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"PrepAI" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your PrepAI password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #0f172a;">Reset your password</h2>
        <p>We received a request to reset your PrepAI password. Click the button below to choose a new one.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #6f6ff5; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #64748b; font-size: 13px;">
          This link expires in 1 hour. If you didn't request this, you can safely ignore this email -
          your password will stay unchanged.
        </p>
        <p style="color: #94a3b8; font-size: 12px; word-break: break-all;">
          Or copy this link: ${resetUrl}
        </p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };