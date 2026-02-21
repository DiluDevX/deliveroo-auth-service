export interface ResetPasswordTemplateParams {
  companyName: string;
  logoUrl: string;
  resetUrl: string;
  supportEmail: string;
}

export const resetPasswordTemplate = ({
  companyName,
  logoUrl,
  resetUrl,
  supportEmail,
}: ResetPasswordTemplateParams) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap');

      body {
        font-family:
          IBM Plex Sans,
          serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .logo {
        text-align: center;
        margin-bottom: 20px;
      }
      .logo img {
        max-height: 60px;
      }
      .button {
        display: inline-block;
        background-color: #00ccbc;
        color: white;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 4px;
        margin: 20px 0;
        font-weight: bold;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #666;
        border-top: 1px solid #eee;
        padding-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="logo">
      <img src="${logoUrl}" alt="${companyName} Logo" />
    </div>

    <h1>Reset Your Password</h1>

    <p>Hello,</p>

    <p>
      We received a request to reset your password. If you didn't make this request, you can safely
      ignore this email.
    </p>

    <p>To reset your password, please click the button below:</p>

    <a href="${resetUrl}" class="button">Reset Password</a>

    <p>This link will expire in 1 hour for security reasons.</p>

    <p>If the button above doesn't work, copy and paste the following link into your browser:</p>

    <p>${resetUrl}</p>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
      <p>
        If you need any assistance, please contact us at
        <a href="mailto:${supportEmail}">${supportEmail}</a>.
      </p>
    </div>
  </body>
</html>
`;
