export const mailConfig = {
  smtp: {
    host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
    port: Number(process.env.SMTP_PORT) || 2525,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  companyName: process.env.COMPANY_NAME,
  companyEmail: process.env.COMPANY_EMAIL,
  logoUrl: process.env.LOGO_URL,
  supportEmail: process.env.SUPPORT_EMAIL,
  appUrl: process.env.APP_URL,
};
