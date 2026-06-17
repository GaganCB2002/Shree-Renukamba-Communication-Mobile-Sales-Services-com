const sendMessage = async (to, message) => {
  console.log(`[LOCAL WHATSAPP] To: ${to}, Message: ${message}`);
  return { success: true, local: true };
};

const sendOrderConfirmation = async (to, order) => {
  console.log(`[LOCAL WHATSAPP] Order confirmation sent to ${to}`);
  return { success: true };
};

const sendRepairUpdate = async (to, repair) => {
  console.log(`[LOCAL WHATSAPP] Repair update sent to ${to}`);
  return { success: true };
};

const handleIncomingMessage = async (from, messageBody) => {
  console.log(`[LOCAL WHATSAPP] Incoming from ${from}: ${messageBody || '(no message)'}`);
  return { success: true, from, message: messageBody };
};

const verifyWebhook = async (req) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return { verified: true, challenge };
  }
  return { verified: false };
};

module.exports = { sendMessage, sendOrderConfirmation, sendRepairUpdate, handleIncomingMessage, verifyWebhook };
