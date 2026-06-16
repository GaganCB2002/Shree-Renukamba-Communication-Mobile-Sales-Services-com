const sendEmail = async ({ to, subject, html }) => {
  console.log(`[LOCAL EMAIL] To: ${to}, Subject: ${subject}`);
  return { success: true, local: true };
};

module.exports = { sendEmail };
