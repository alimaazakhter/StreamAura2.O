import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";
import { logAdminActivity, sendSlackNotification } from "@/lib/integrations";

export async function POST(req: Request) {
  let emailAttempt = "unknown";
  try {
    const { email } = await req.json();
    if (email) emailAttempt = email;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email address not found" },
        { status: 404 }
      );
    }

    const name = user.name || "StreamAura Member";

    // Generate secure random reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 3600000; // 1 hour expiry

    // Save token to Supabase User model
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: new Date(expiry),
      },
    });

    // Log password reset request activity
    await logAdminActivity(
      "FORGOT_PASSWORD_REQUEST",
      `Password reset link requested for ${email.toLowerCase()} (${name})`
    );

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    // Check if real Resend API Key is set up
    const resendApiKey = process.env.RESEND_API_KEY;
    const isMockMode = !resendApiKey || resendApiKey === "re_YOUR_RESEND_API_KEY";

    if (isMockMode) {
      // Graceful fallback to Sandbox/Mock mode if key is missing
      return NextResponse.json(
        {
          success: true,
          isMock: true,
          message: "Reset link generated in sandbox mode (Resend API key missing)",
          resetUrl,
        },
        { status: 200 }
      );
    }

    // Real Email Delivery Flow using Resend
    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: "StreamAura <onboarding@resend.dev>",
      to: email,
      subject: "Reset your StreamAura Password",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0b0b15; color: #ffffff; padding: 40px 20px; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #1a1a2e; border: 1px solid #ff007f30; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h2 style="color: #ff007f; margin-bottom: 10px; font-size: 26px;">StreamAura</h2>
            <p style="color: #e2e8f0; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
              Hi ${name},<br>
              We received a request to reset your password. Click the button below to secure your account and set up a new password:
            </p>
            <a href="${resetUrl}" style="display: inline-block; padding: 14px 30px; background-color: #ff007f; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 12px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(255,0,127,0.4);">
              Reset Password
            </a>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; line-height: 1.5;">
              If you didn't request a password reset, you can safely ignore this email.<br>
              This link is secure and will expire in 1 hour.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      {
        success: true,
        isMock: false,
        message: "A password reset email has been successfully sent to your inbox.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);

    // Log system errors and alert Slack
    try {
      await logAdminActivity(
        "FORGOT_PASSWORD_ERROR",
        `Forgot password request failed for ${emailAttempt}. Error: ${error.message || error}`
      );
      await sendSlackNotification(
        "🔥 Password Reset Request Failure",
        `*Attempted Email:* ${emailAttempt}\n*Error details:* ${error.message || error}`,
        "#ef4444"
      );
    } catch (logErr) {
      console.error("Failed to audit forgot password error:", logErr);
    }

    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
