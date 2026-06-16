const sendEmailNodemailer = async ({ to, subject, html }) => {
  console.log(`[LOCAL NODEMAILER] To: ${to}, Subject: ${subject}`);
  return { success: true, local: true };
};

module.exports = { sendEmailNodemailer };
