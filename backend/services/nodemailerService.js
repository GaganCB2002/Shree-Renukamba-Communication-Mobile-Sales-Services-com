const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('Using Ethereal test email:', testAccount.user);
  }

  return transporter;
};

const sendEmailNodemailer = async ({ to, subject, html }) => {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: `"Shree Renukamba Communication" <${process.env.SMTP_USER || 'noreply@shreerenukamba.com'}>`,
      to,
      subject,
      html,
    });

    if (info.messageId && info.accepted) {
      console.log('Email sent successfully:', info.messageId);
      if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Nodemailer send failed:', error);
    throw new Error('Email sending failed');
  }
};

module.exports = { sendEmailNodemailer };
