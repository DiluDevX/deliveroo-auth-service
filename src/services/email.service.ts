import nodemailer from 'nodemailer';
import { resetPasswordTemplate } from '../templates/reset-password';
import { environment } from '../config/environment';

const companyName = environment.mail.companyName;
const companyEmail = environment.mail.companyEmail;
const logoUrl = environment.mail.logoUrl;
const supportEmail = environment.mail.supportEmail;
const appUrl = environment.mail.appUrl;

const transporter = nodemailer.createTransport({
  host: environment.mail.smtp.host,
  port: environment.mail.smtp.port,
  auth: {
    user: environment.mail.smtp.user,
    pass: environment.mail.smtp.pass,
  },
});

const sendMail = async ({
  to,
  from,
  subject,
  html,
}: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('[MailService] Error sending email:', error);
    throw error;
  }
};

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const resetUrl = `${appUrl}/account/reset-password?token=${encodeURIComponent(token)}`;
  const html = resetPasswordTemplate({
    companyName,
    logoUrl,
    resetUrl,
    supportEmail,
  });

  await sendMail({
    from: `${companyName} <${companyEmail}>`,
    to,
    subject: 'Reset Your Deliveroo Password',
    html,
  });
};
