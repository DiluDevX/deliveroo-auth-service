import { Resend } from 'resend';
import { resetPasswordTemplate } from '../templates/reset-password';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';

const companyName = environment.mail.companyName;
const companyEmail = environment.mail.companyEmail;
const logoUrl = environment.mail.logoUrl;
const supportEmail = environment.mail.supportEmail;
const appUrl = environment.mail.appUrl;

const resend = new Resend(environment.mail.resendApiKey);

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
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    logger.error(error);
    throw new Error('Failed to send email');
  }
  logger.info(`Email sent to ${to} with subject "${subject}"`);
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
    subject: `Reset Your ${companyName} Password`,
    html,
  });
};
