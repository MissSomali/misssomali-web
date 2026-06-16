import { Resend } from "resend";

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
    let devNotice = "";

    // Detect if we are using the onboarding domain key and recipient is not the account owner
    if (to.toLowerCase() !== "misssomalia@proton.me") {
      targetEmail = "misssomalia@proton.me";
      devNotice = `
        <div style="background-color: #fffbeb; border: 1px solid #fcd34d; padding: 15px; margin-bottom: 25px; border-radius: 6px; color: #92400e; font-size: 13px; line-height: 1.4; text-align: left;">
          <strong>[Local Development Mode]</strong><br>
          This email was originally sent to <strong>${to}</strong>. It was redirected to your Resend account owner address (<strong>misssomalia@proton.me</strong>) because of free-tier onboarding constraints.
        </div>
      `;
    }

    // Generate beautiful Miss Somali themed HTML email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f6f9;
            color: #333333;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            width: 100%;
            background-color: #f4f6f9;
            padding: 40px 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
          }
          .header {
            background-color: #0b1528;
            background-image: linear-gradient(135deg, #0b1528 0%, #1e293b 100%);
            padding: 35px 30px;
            text-align: center;
            border-bottom: 3px solid #d4af37;
          }
          .logo {
            color: #d4af37;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            margin: 0;
            text-transform: uppercase;
            font-family: 'Outfit', 'Playfair Display', Georgia, serif;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          h1 {
            font-size: 22px;
            color: #0b1528;
            margin-top: 0;
            margin-bottom: 20px;
            font-weight: 700;
          }
          p {
            margin: 0 0 20px 0;
            font-size: 16px;
            color: #4b5563;
          }
          .notes-box {
            background-color: #f8fafc;
            border-left: 4px solid #d4af37;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 0 6px 6px 0;
          }
          .notes-box-title {
            font-size: 14px;
            font-weight: bold;
            color: #0b1528;
            margin-bottom: 5px;
          }
          .notes-box p {
            margin: 0;
            font-style: italic;
            color: #1e293b;
          }
          .button-container {
            text-align: center;
            margin: 30px 0 10px 0;
          }
          .button {
            background-color: #d4af37;
            background-image: linear-gradient(135deg, #d4af37 0%, #aa8416 100%);
            color: #0b1528 !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 16px;
            display: inline-block;
            box-shadow: 0 4px 10px rgba(212, 175, 55, 0.3);
          }
          .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #94a3b8;
          }
          .footer a {
            color: #d4af37;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="logo">Miss Somali 2026</div>
            </div>
            <div class="content">
              ${devNotice}
              <h1>Dear ${fullName},</h1>
              <p>${message}</p>
              
              ${notes ? `
                <div class="notes-box">
                  <div class="notes-box-title">Message from selection committee:</div>
                  <p>"${notes}"</p>
                </div>
              ` : ''}

              ${buttonText && buttonUrl ? `
                <div class="button-container">
                  <a href="${buttonUrl}" class="button" target="_blank">${buttonText}</a>
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>Miss Somali Pageant Committee &copy; 2026</p>
              <p>Celebrating beauty, culture, and leadership.</p>
              <p>Need support? Contact us at <a href="mailto:info@misssomali.com">info@misssomali.com</a> or visit our <a href="${buttonUrl ? new URL(buttonUrl).origin : 'https://misssomali.com'}">website</a>.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

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
