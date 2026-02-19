import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { resetPasswordTemplate } from '../templates/reset-password';
import { mailConfig } from '../config/mail.config';
dotenv.config();

const companyName = mailConfig.companyName;
const companyEmail = mailConfig.companyEmail;
const logoUrl = mailConfig.logoUrl;
const supportEmail = mailConfig.supportEmail;
const appUrl = mailConfig.appUrl;

if (!companyName || !companyEmail || !logoUrl || !supportEmail || !appUrl) {
  throw new Error('Mail configuration missing');
}

const transporter = nodemailer.createTransport({
  host: mailConfig.smtp.host,
  port: mailConfig.smtp.port,
  auth: {
    user: mailConfig.smtp.user,
    pass: mailConfig.smtp.pass,
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
