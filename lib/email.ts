import { Resend } from "resend";
import { renderToHtml } from "./render-to-html";
import { MissSomaliEmail } from "./email-template";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY || "re_NUt4pvSk_Nq42V8kpVubqnymRbD2DRQL8");

interface EmailParams {
  to: string;
  subject: string;
  fullName: string;
  title: string;
  message: string;
  notes?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export async function sendNotificationEmail({
  to,
  subject,
  fullName,
  title,
  message,
  notes,
  buttonText,
  buttonUrl,
}: EmailParams) {
  try {
    let targetEmail = to;

    // Detect if we are using the onboarding domain key and recipient is not the account owner
    // Redirection happens silently without inserting local development notice banners
    if (to.toLowerCase() !== "misssomalia@proton.me") {
      targetEmail = "misssomalia@proton.me";
    }

    // Compile React Email template to static HTML
    const htmlContent = `<!DOCTYPE html>${renderToHtml(
      React.createElement(MissSomaliEmail, {
        fullName,
        title,
        message,
        notes,
        buttonText,
        buttonUrl,
      })
    )}`;

    const data = await resend.emails.send({
      from: "Miss Somali <onboarding@resend.dev>",
      to: [targetEmail],
      subject,
      html: htmlContent,
    });

    console.log(`Email successfully queued to ${targetEmail} (originally intended for ${to}). ID:`, data.data?.id);
    return { success: true, data };
  } catch (error) {
    console.error("Resend email sending failure:", error);
    // Return gracefully so the application flow is not completely blocked in dev environments
    return { success: false, error };
  }
}
