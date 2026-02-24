import {
  otpEmailTemplateArgs,
  resetPasswordEmailTemplateArgs,
  resetPasswordRequestEmailTemplateArgs,
  welcomeEmailTemplateArgs,
} from "../interface/email.interface.js";

export const generateOtpEmailTemplate = ({
  otp,
  userName = "Developer",
}: otpEmailTemplateArgs): string => {
  const primary = "#135bec";
  const textDark = "#0d121b";
  const textMuted = "#4c669a";
  const white = "#ffffff";
  const bodyFont = `'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;

  const otpDigits = (otp || "")
    .split("")
    .map(
      (digit) => `
              <td style="padding: 0 5px;">
                <div style="width: 52px; height: 64px; background-color: ${white}; border: 1.5px solid #d4e0ff; border-radius: 10px; text-align: center; line-height: 64px; font-family: ${bodyFont}; font-size: 28px; font-weight: 900; color: ${primary};">${digit}</div>
              </td>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Verify your DevCheck account</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;900&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: ${bodyFont};">

  <!-- Preheader -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    Your DevCheck verification code is ${otp || "------"}. It expires in 10 minutes.&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Email card -->
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0"
          style="max-width: 560px; background-color: ${white}; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(0,0,0,0.07);">

          <!-- HEADER -->
          <tr>
            <td style="background-color: ${primary}; border-radius: 16px 16px 0 0; padding: 32px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="52" style="vertical-align: middle;">
                    <div style="width: 44px; height: 44px; background-color: rgba(255,255,255,0.18); border-radius: 10px; border: 1px solid rgba(255,255,255,0.22); text-align: center; line-height: 44px; font-size: 22px; color: ${white};">✓</div>
                  </td>
                  <td style="vertical-align: middle; padding-left: 12px;">
                    <div style="font-family: ${bodyFont}; font-weight: 900; font-size: 22px; color: ${white}; letter-spacing: -0.02em;">DevCheck</div>
                    <div style="font-family: ${bodyFont}; font-size: 12px; color: rgba(255,255,255,0.62); margin-top: 2px; letter-spacing: 0.04em;">Built for engineers &amp; designers</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding: 40px 40px 32px;">

              <!-- Greeting -->
              <div style="font-family: ${bodyFont}; font-weight: 700; font-size: 22px; color: ${textDark}; letter-spacing: -0.02em; margin-bottom: 10px;">Verify your email, ${userName}</div>

              <!-- Description -->
              <p style="font-family: ${bodyFont}; font-size: 14px; line-height: 1.7; color: ${textMuted}; margin: 0 0 32px 0;">
                Use the following code to complete your sign-up and start managing your tasks faster. It expires in&nbsp;10&nbsp;minutes.
              </p>

              <!-- OTP box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="background-color: #f0f4ff; border: 1.5px dashed ${primary}; border-radius: 12px; padding: 28px 24px;">

                    <!-- ONE-TIME CODE label -->
                    <div style="font-family: ${bodyFont}; font-size: 9px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: #8aaaf0; text-align: center; margin-bottom: 16px;">One-Time Code</div>

                    <!-- Digit tiles -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 20px;">
                      <tr>${otpDigits || '<td style="padding: 0 5px;"><div style="width: 52px; height: 64px; background-color: #f0f4ff; border: 1.5px dashed #d4e0ff; border-radius: 10px;"></div></td>'}</tr>
                    </table>

                    <!-- Expiry note -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 6px;">
                          <div style="width: 6px; height: 6px; background-color: #22c55e; border-radius: 50%; box-shadow: 0 0 0 3px rgba(34,197,94,0.2);"></div>
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-family: ${bodyFont}; font-size: 12px; color: #8aaaf0;">Active &mdash; expires in 10 minutes</span>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Ignore notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 8px;">
                <tr>
                  <td style="background-color: #fafbff; border-left: 3px solid #e0e8ff; border-radius: 0 8px 8px 0; padding: 14px 16px;">
                    <span style="font-family: ${bodyFont}; font-size: 13px; color: #94a3b8; line-height: 1.6;">Didn't request this? You can safely ignore this email &mdash; nothing will change on your account.</span>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background: linear-gradient(to right, transparent, #e5e7eb 30%, #e5e7eb 70%, transparent);"></div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <div style="font-family: ${bodyFont}; font-size: 12px; color: #a0aec0; line-height: 1.6;">&copy; 2026 DevCheck Inc.</div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <a href="#" style="font-family: ${bodyFont}; font-size: 12px; font-weight: 500; color: ${primary}; text-decoration: none; margin-left: 16px; transition: opacity 0.15s;">Docs</a>
                    <a href="#" style="font-family: ${bodyFont}; font-size: 12px; font-weight: 500; color: ${primary}; text-decoration: none; margin-left: 16px; transition: opacity 0.15s;">GitHub</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Email card -->

      </td>
    </tr>
  </table>

</body>
</html>`;
};
export const generateWelcomeEmailTemplate = ({
  userName = "Developer",
  dashboardUrl = "https://app.devcheck.com/dashboard",
}: welcomeEmailTemplateArgs): string => {
  const primary = "#135bec";
  const white = "#ffffff";
  const textDark = "#0d121b";
  const textMuted = "#4c669a";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to DevCheck</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background:#f0f4f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f4f8;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; background:${white}; border-radius:16px; border:1px solid #e2e8f0;">

          <!-- Header -->
          <tr>
            <td style="background:${primary}; border-radius:16px 16px 0 0; padding:32px 40px;">
              <table width="100%">
                <tr>
                  <td width="44" style="vertical-align:middle;">
                    <div style="width:44px; height:44px; background:rgba(255,255,255,0.18); border-radius:10px; text-align:center; line-height:44px; color:${white}; font-size:22px;">✓</div>
                  </td>
                  <td style="padding-left:12px;">
                    <div style="font-size:22px; font-weight:900; color:${white};">DevCheck</div>
                    <div style="font-size:12px; color:rgba(255,255,255,0.62);">Built for engineers & designers</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <div style="font-size:12px; font-weight:500; color:${primary}; text-transform:uppercase; margin-bottom:8px;">✨ Welcome aboard</div>
              <div style="font-size:26px; font-weight:700; color:${textDark}; margin-bottom:12px;">Hey ${userName}!</div>
                  <p style="font-size:15px; line-height:1.6; color:${textMuted}; margin:0 0 16px;">
                    Welcome to DevCheck!
                  </p>

                  <p style="font-size:15px; line-height:1.6; color:${textMuted}; margin:0 0 16px;">
                    We're excited to have you on board. Your account has been successfully created, and you're now ready to start organizing your workflow, tracking progress, and building with confidence.
                  </p>

                  <p style="font-size:15px; line-height:1.6; color:${textMuted}; margin:0 0 16px;">
                    If you ever need help getting started, we're here for you.
                  </p>

                  <p style="font-size:15px; line-height:1.6; color:${textMuted}; margin:0;">
                    Let’s build something great.<br/>
                    — The DevCheck Team
                  </p>

              <!-- CTA Button -->
              <table width="100%" style="margin:32px 0;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display:inline-block; background:${primary}; color:${white}; font-size:16px; font-weight:600; padding:16px 40px; border-radius:12px; text-decoration:none;">Go to your dashboard →</a>
                  </td>
                </tr>
              </table>

              <!-- Quick tip -->
              <div style="background:#f8faff; padding:20px; border-radius:0px; border-left:4px solid ${primary}; margin:24px 0;">
                <div style="font-weight:700; margin-bottom:8px;">⚡ Quick tip</div>
                <div style="font-size:14px; color:${textMuted};">Complete your profile and invite your team to get the most out of DevCheck.</div>
              </div>

              <!-- Help text -->
              <p style="font-size:12px; color:#94a3b8; text-align:center; margin:24px 0 0;">
                Questions? Visit our <a href="#" style="color:${primary};">help center</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px; border-top:1px solid #e5e7eb;">
              <table width="100%">
                <tr>
                  <td style="font-size:12px; color:#a0aec0;">© 2026 DevCheck Inc.</td>
                  <td align="right">
                    <a href="#" style="color:${primary}; text-decoration:none; font-size:12px; margin-left:16px;">Docs</a>
                    <a href="#" style="color:${primary}; text-decoration:none; font-size:12px; margin-left:16px;">GitHub</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
export const generateResetPasswordRequestEmailTemplate = ({
  userName = "Developer",
  resetLink = "https://app.devcheck.com/reset-password?token=example",
  expiresIn = "30 minutes",
  supportUrl = "https://app.devcheck.com/support",
}: resetPasswordRequestEmailTemplateArgs): string => {
  const primary = "#135bec";
  const white = "#ffffff";
  const textDark = "#0d121b";
  const textMuted = "#4c669a";
  const warning = "#f59e0b";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password - DevCheck</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background:#f0f4f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f4f8;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; background:${white}; border-radius:16px; border:1px solid #e2e8f0;">

          <!-- Header -->
          <tr>
            <td style="background:${primary}; border-radius:16px 16px 0 0; padding:32px 40px;">
              <table width="100%">
                <tr>
                  <td width="44" style="vertical-align:middle;">
                    <div style="width:44px; height:44px; background:rgba(255,255,255,0.18); border-radius:10px; text-align:center; line-height:44px; color:${white}; font-size:22px;">✓</div>
                  </td>
                  <td style="padding-left:12px;">
                    <div style="font-size:22px; font-weight:900; color:${white};">DevCheck</div>
                    <div style="font-size:12px; color:rgba(255,255,255,0.62);">Built for engineers & designers</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">

              <!-- Icon -->
              <div style="width:64px; height:64px; background:${warning}; border-radius:50%; margin:0 auto 24px; text-align:center; line-height:64px; color:${white}; font-size:32px;">🔑</div>

              <!-- Heading -->
              <div style="font-size:24px; font-weight:700; color:${textDark}; text-align:center; margin-bottom:12px;">Reset Your Password</div>

              <!-- Greeting -->
              <div style="font-size:18px; color:${textDark}; text-align:center; margin-bottom:20px;">Hi ${userName},</div>

              <!-- Message -->
              <p style="font-size:15px; line-height:1.6; color:${textMuted}; text-align:center; margin:0 0 16px;">
                We received a request to reset your DevCheck account password.
              </p>

              <p style="font-size:15px; line-height:1.6; color:${textMuted}; text-align:center; margin:0 0 8px;">
                Click the button below to create a new password:
              </p>

              <p style="font-size:14px; color:${warning}; text-align:center; font-weight:500; margin:0 0 32px;">
                ⏱️ This link expires in ${expiresIn}
              </p>

              <!-- CTA Button -->
              <table width="100%" style="margin:32px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display:inline-block; background:${primary}; color:${white}; font-size:16px; font-weight:600; padding:16px 40px; border-radius:12px; text-decoration:none;">Reset Password →</a>
                  </td>
                </tr>
              </table>

              <!-- Alternative link -->
              <p style="font-size:13px; color:${textMuted}; text-align:center; margin:16px 0 24px;">
                Or copy this link: <br>
                <span style="color:${primary};">${resetLink}</span>
              </p>

              <!-- Ignore notice -->
              <div style="background:#f8faff; padding:20px; border-radius:12px; border-left:4px solid ${textMuted}; margin:24px 0;">
                <div style="font-weight:700; color:${textDark}; margin-bottom:8px;">🙈 Didn't request this?</div>
                <div style="font-size:14px; color:${textMuted};">
                  If you didn't ask to reset your password, you can safely ignore this email.
                  Your account is still secure.
                </div>
              </div>

              <!-- Help text -->
              <p style="font-size:12px; color:#94a3b8; text-align:center; margin:32px 0 0;">
                Need help? <a href="${supportUrl}" style="color:${primary};">Contact support</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px; border-top:1px solid #e5e7eb;">
              <table width="100%">
                <tr>
                  <td style="font-size:12px; color:#a0aec0;">© 2026 DevCheck Inc.</td>
                  <td align="right">
                    <a href="#" style="color:${primary}; text-decoration:none; font-size:12px; margin-left:16px;">Security</a>
                    <a href="#" style="color:${primary}; text-decoration:none; font-size:12px; margin-left:16px;">Privacy</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
export const generateResetPasswordSuccessEmailTemplate = ({
  userName = "Developer",
  loginUrl = "https://app.devcheck.com/login",
  supportUrl = "https://app.devcheck.com/support",
}: resetPasswordEmailTemplateArgs): string => {
  const primary = "#135bec";
  const white = "#ffffff";
  const textDark = "#0d121b";
  const textMuted = "#4c669a";
  const success = "#10b981";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Changed Successfully - DevCheck</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background:#f0f4f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f4f8;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; background:${white}; border-radius:16px; border:1px solid #e2e8f0;">

          <!-- Header -->
          <tr>
            <td style="background:${primary}; border-radius:16px 16px 0 0; padding:32px 40px;">
              <table width="100%">
                <tr>
                  <td width="44" style="vertical-align:middle;">
                    <div style="width:44px; height:44px; background:rgba(255,255,255,0.18); border-radius:10px; text-align:center; line-height:44px; color:${white}; font-size:22px;">✓</div>
                  </td>
                  <td style="padding-left:12px;">
                    <div style="font-size:22px; font-weight:900; color:${white};">DevCheck</div>
                    <div style="font-size:12px; color:rgba(255,255,255,0.62);">Built for engineers & designers</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">

              <!-- Success Icon -->
              <div style="width:64px; height:64px; background:${success}; border-radius:50%; margin:0 auto 24px; text-align:center; line-height:64px; color:${white}; font-size:32px; font-weight:bold;">✓</div>

              <!-- Heading -->
              <div style="font-size:24px; font-weight:700; color:${textDark}; text-align:center; margin-bottom:12px;">Password Changed Successfully</div>

              <!-- Greeting -->
              <div style="font-size:18px; color:${textDark}; text-align:center; margin-bottom:20px;">Hi ${userName},</div>

              <!-- Message -->
              <p style="font-size:15px; line-height:1.6; color:${textMuted}; text-align:center; margin:0 0 16px;">
                Your DevCheck account password has been changed successfully.
              </p>

              <p style="font-size:15px; line-height:1.6; color:${textMuted}; text-align:center; margin:0 0 32px;">
                If you made this change, you're all set. If you didn't, please contact our support team immediately.
              </p>

              <!-- CTA Button -->
              <table width="100%" style="margin:32px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display:inline-block; background:${primary}; color:${white}; font-size:16px; font-weight:600; padding:16px 40px; border-radius:12px; text-decoration:none;">Log in to your account →</a>
                  </td>
                </tr>
              </table>

              <!-- Support Info -->
              <div style="background:#fef2f2; padding:20px; border-radius:12px; border-left:4px solid #ef4444; margin:24px 0;">
                <div style="font-weight:700; color:#b91c1c; margin-bottom:8px;">⚠️ Didn't request this change?</div>
                <div style="font-size:14px; color:#7f1d1d;">
                  If you didn't change your password, someone else might have access to your account.
                  <a href="${supportUrl}" style="color:${primary}; text-decoration:none; font-weight:500;">Contact support immediately →</a>
                </div>
              </div>

              <!-- Security Tips -->
              <div style="background:#f8faff; padding:16px; border-radius:12px; margin:24px 0 0;">
                <div style="font-weight:600; color:${textDark}; margin-bottom:8px;">🔐 Security tips:</div>
                <ul style="margin:0; padding-left:20px; color:${textMuted}; font-size:13px; line-height:1.6;">
                  <li>Use a unique password for each of your accounts</li>
                  <li>Enable two-factor authentication for extra security</li>
                  <li>Never share your password with anyone</li>
                </ul>
              </div>

              <!-- Help text -->
              <p style="font-size:12px; color:#94a3b8; text-align:center; margin:32px 0 0;">
                Questions? <a href="${supportUrl}" style="color:${primary};">Contact support</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px; border-top:1px solid #e5e7eb;">
              <table width="100%">
                <tr>
                  <td style="font-size:12px; color:#a0aec0;">© 2026 DevCheck Inc.</td>
                  <td align="right">
                    <a href="#" style="color:${primary}; text-decoration:none; font-size:12px; margin-left:16px;">Security</a>
                    <a href="#" style="color:${primary}; text-decoration:none; font-size:12px; margin-left:16px;">Privacy</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
