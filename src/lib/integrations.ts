import { prisma } from "./prisma";
import { Resend } from "resend";

/**
 * Logs an administrative or system event directly to Supabase via Prisma.
 */
export async function logAdminActivity(action: string, details: string) {
  try {
    await prisma.adminActivityLog.create({
      data: {
        action: action.toUpperCase(),
        details,
      },
    });
  } catch (error) {
    console.error(`[Admin Logger] Failed to save log for action ${action}:`, error);
  }
}

/**
 * Sends a rich, branded notification alert to Slack via webhook.
 */
export async function sendSlackNotification(
  title: string,
  message: string,
  color: string = "#ff007f", // Brand crimson default
  fields?: { title: string; value: string; short?: boolean }[]
) {
  try {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    const isMock = !slackWebhookUrl || slackWebhookUrl.includes("YOUR/WEBHOOK/URL");

    if (isMock) {
      console.warn(`[Slack Mock] Title: ${title} | Msg: ${message}`);
      return;
    }

    const slackPayload: any = {
      text: `🔔 *${title}*`,
      attachments: [
        {
          color,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `${message}`,
              },
            },
          ],
        },
      ],
    };

    if (fields && fields.length > 0) {
      const fieldsBlock = {
        type: "section",
        fields: fields.map((f) => ({
          type: "mrkdwn",
          text: `*${f.title}:*\n${f.value}`,
        })),
      };
      slackPayload.attachments[0].blocks.push(fieldsBlock);
    }

    // Add metadata context footer
    slackPayload.attachments[0].blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `📧 StreamAura Integration Engine | ${new Date().toLocaleString()}`,
        },
      ],
    });

    const res = await fetch(slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackPayload),
    });

    if (!res.ok) {
      console.error(`[Slack Webhook] Post failed with status code ${res.status}`);
    }
  } catch (error) {
    console.error("[Slack Webhook] Failed to send message:", error);
  }
}

/**
 * Sends a premium-styled thank you autoresponder email to users via Resend.
 */
export async function sendAutoresponderEmail(toEmail: string, userName: string, subjectLine: string, messageBody: string) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const isMock = !resendApiKey || resendApiKey === "re_YOUR_RESEND_API_KEY";

    const cleanName = userName || "Valued StreamAura Member";

    if (isMock) {
      console.warn(`[Resend Mock] Send email to ${toEmail} | Subject: ${subjectLine}`);
      return { success: true, isMock: true };
    }

    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: "StreamAura Team <onboarding@resend.dev>",
      to: toEmail,
      subject: subjectLine,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #080810; color: #f8fafc; padding: 50px 20px; margin: 0;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0f0f1d; border: 1px solid rgba(255, 0, 127, 0.15); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
            
            <!-- Header -->
            <tr>
              <td align="center" style="padding: 40px 40px 10px 40px;">
                <span style="font-size: 28px; font-weight: 800; color: #ff007f; letter-spacing: 1px; text-transform: uppercase;">
                  StreamAura
                </span>
                <div style="width: 50px; height: 3px; background-color: #ff007f; margin-top: 15px; border-radius: 2px;"></div>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 30px 40px; font-size: 16px; line-height: 1.7; color: #cbd5e1;">
                <p style="font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 20px;">
                  Hello ${cleanName},
                </p>
                <p>
                  Thank you for reaching out to us. We have successfully received your feedback/message submission regarding <strong>"${subjectLine}"</strong>.
                </p>
                <p style="background-color: rgba(255,255,255,0.03); border-left: 3px solid #ff007f; padding: 15px 20px; border-radius: 0 12px 12px 0; margin: 25px 0; font-style: italic; color: #e2e8f0;">
                  "${messageBody}"
                </p>
                <p>
                  Our support team has logged this request in our database. We appreciate your valuable suggestions and will review them shortly. If action is required, one of our representatives will contact you back at this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding: 30px 40px 40px 40px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 12px; color: #64748b; line-height: 1.5;">
                <p style="margin: 0 0 10px 0;">This is an automated receipt from the StreamAura Support Team.</p>
                <p style="margin: 0;">© ${new Date().getFullYear()} StreamAura. All rights reserved.</p>
              </td>
            </tr>

          </table>
        </div>
      `,
    });

    return { success: true, isMock: false };
  } catch (error) {
    console.error(`[Resend Autoresponder] Failed to send email to ${toEmail}:`, error);
    throw error;
  }
}
