/**
 * AWS Cognito CustomMessage Lambda Trigger
 * 
 * Customizes email templates for Cognito User Pool events.
 * Specifically handles ForgotPassword event to send password reset link.
 * 
 * @see https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-custom-message.html
 */

import { Handler, CustomMessageTriggerEvent } from 'aws-lambda';

// Environment variables
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Generates HTML email for password reset with link
 */
function generatePasswordResetEmail(email: string, code: string): string {
    const resetLink = `${FRONTEND_URL}/reset-password?code=${code}&email=${encodeURIComponent(email)}`;

    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset Request</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #f5f5f5; padding: 20px 0"
    >
      <tr>
        <td align="center">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            "
          >
            <!-- Header -->
            <tr>
              <td
                style="
                  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
                  padding: 40px;
                  text-align: center;
                  border-radius: 8px 8px 0 0;
                "
              >
                <h1
                  style="
                    color: #ffffff;
                    margin: 0;
                    font-size: 28px;
                    font-weight: 600;
                  "
                >
                  🔐 Password Reset Request
                </h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px">
                <h2
                  style="
                    color: #232f3e;
                    margin: 0 0 20px 0;
                    font-size: 24px;
                    font-weight: 600;
                  "
                >
                  Reset Your Password
                </h2>

                <p
                  style="
                    color: #37475a;
                    font-size: 16px;
                    line-height: 24px;
                    margin: 0 0 20px 0;
                  "
                >
                  We received a request to reset your password for your AWS Quiz
                  Platform account. Click the button below to create a new password:
                </p>

                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding: 30px 0">
                      <a
                        href="${resetLink}"
                        style="
                          display: inline-block;
                          background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
                          color: #ffffff;
                          text-decoration: none;
                          padding: 16px 40px;
                          border-radius: 6px;
                          font-size: 18px;
                          font-weight: 600;
                          box-shadow: 0 4px 12px rgba(255, 153, 0, 0.3);
                        "
                      >
                        Reset Password →
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Fallback Code -->
                <div
                  style="
                    background-color: #f8f9fa;
                    border: 2px dashed #dee2e6;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                  "
                >
                  <p
                    style="
                      color: #6c757d;
                      font-size: 14px;
                      margin: 0 0 10px 0;
                      text-align: center;
                    "
                  >
                    Or enter this code manually:
                  </p>
                  <p
                    style="
                      font-family: 'Courier New', Courier, monospace;
                      font-size: 32px;
                      font-weight: bold;
                      color: #232f3e;
                      text-align: center;
                      margin: 0;
                      letter-spacing: 8px;
                    "
                  >
                    ${code}
                  </p>
                </div>

                <!-- Security Notice -->
                <div
                  style="
                    background-color: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                  "
                >
                  <p
                    style="
                      color: #856404;
                      font-size: 14px;
                      margin: 0;
                      line-height: 20px;
                    "
                  >
                    ⏱️ <strong>This link will expire in 1 hour</strong> for security reasons.
                  </p>
                </div>

                <p
                  style="
                    color: #37475a;
                    font-size: 14px;
                    line-height: 20px;
                    margin: 20px 0 0 0;
                  "
                >
                  If you didn't request this password reset, you can safely ignore this
                  email. Your password will remain unchanged.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  background-color: #f8f9fa;
                  padding: 30px;
                  text-align: center;
                  border-radius: 0 0 8px 8px;
                  border-top: 1px solid #dee2e6;
                "
              >
                <p
                  style="
                    color: #6c757d;
                    font-size: 12px;
                    margin: 0 0 10px 0;
                    line-height: 18px;
                  "
                >
                  This is an automated message from AWS Quiz Platform.<br />
                  Please do not reply to this email.
                </p>
                <p
                  style="
                    color: #adb5bd;
                    font-size: 11px;
                    margin: 0;
                  "
                >
                  © ${new Date().getFullYear()} AWS Quiz Platform. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}

/**
 * Lambda handler for Cognito CustomMessage trigger
 */
export const handler: Handler<CustomMessageTriggerEvent> = async (event) => {
    console.log('CustomMessage trigger event:', JSON.stringify(event, null, 2));

    const { triggerSource, request, userPoolId } = event;
    const email = request.userAttributes.email;
    const code = request.codeParameter;

    try {
        // Handle ForgotPassword event
        if (triggerSource === 'CustomMessage_ForgotPassword') {
            console.log(`Generating password reset email for ${email}`);

            event.response.emailSubject = '🔐 Reset Your AWS Quiz Platform Password';
            event.response.emailMessage = generatePasswordResetEmail(email, code || '');

            console.log(`Password reset email generated successfully for ${email}`);
        }

        // For other events (SignUp, AdminCreateUser), Cognito will use
        // the templates configured in Terraform (cognito.tf)

        return event;
    } catch (error) {
        console.error('Error in CustomMessage Lambda:', error);

        // Return event unchanged so Cognito uses default template
        // This prevents blocking the auth flow
        return event;
    }
};
