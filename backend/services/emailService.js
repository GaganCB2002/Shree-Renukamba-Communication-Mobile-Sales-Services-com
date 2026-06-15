const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 'fallback_key');

const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: 'Shree Renukamba Communication <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
    });
    return data;
  } catch (error) {
    console.error('Email send failed:', error);
    throw new Error('Email sending failed');
  }
};

module.exports = {
  sendEmail,
};
