import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  logAdminActivity,
  sendSlackNotification,
  sendAutoresponderEmail,
} from "@/lib/integrations";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Please fill in all contact form fields" },
        { status: 400 }
      );
    }

    // 1. Save submission to Supabase
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email: email.toLowerCase(),
        subject,
        message,
      },
    });

    // 2. Log activity
    await logAdminActivity(
      "CONTACT_SUBMISSION",
      `Feedback submission from ${name} (${email}) - Subject: "${subject}"`
    );

    // 3. Dispatch Slack Webhook Alert
    let slackSuccess = false;
    try {
      await sendSlackNotification(
        "🚨 New Feedback Received",
        `*From:* ${name} (<mailto:${email}|${email}>)\n*Subject:* *${subject}*\n*Message:*\n${message}`,
        "#ff007f", // StreamAura brand color
        [
          { title: "Database Record ID", value: submission.id },
          { title: "Status", value: "Stored in Supabase" },
        ]
      );
      slackSuccess = true;
    } catch (slackError) {
      console.error("Failed to dispatch Slack alert for contact form:", slackError);
    }

    // 4. Dispatch Resend Autoresponder Email
    let emailSuccess = false;
    try {
      const emailResult = await sendAutoresponderEmail(
        email.toLowerCase(),
        name,
        `StreamAura Team: Received message about "${subject}"`,
        message
      );
      emailSuccess = emailResult?.success && !emailResult?.isMock;
    } catch (emailError) {
      console.error("Failed to send autoresponder confirmation email:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been successfully recorded!",
        id: submission.id,
        emailSent: emailSuccess,
        slackNotified: slackSuccess,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Contact API submission error:", error);
    
    // Log fatal errors to admin activity log
    try {
      await logAdminActivity(
        "CONTACT_FORM_ERROR",
        `System failed to record contact submission. Error: ${error.message || error}`
      );
      await sendSlackNotification(
        "🔥 Contact Form Submission Failure",
        `*Error:* ${error.message || error}`,
        "#ef4444" // Crimson red error highlight
      );
    } catch (logErr) {
      console.error("Failed to record error audit state:", logErr);
    }

    return NextResponse.json(
      { error: error.message || "Failed to submit message details" },
      { status: 500 }
    );
  }
}
