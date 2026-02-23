import { Resend } from 'resend';
import { resetPasswordTemplate } from '../templates/reset-password';
import { environment } from '../config/environment';

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
  try {
    await resend.emails.send({
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
