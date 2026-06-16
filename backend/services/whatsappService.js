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

const handleIncomingMessage = async (body) => {
  console.log(`[LOCAL WHATSAPP] Incoming: ${body}`);
  return { success: true };
};

module.exports = { sendMessage, sendOrderConfirmation, sendRepairUpdate, handleIncomingMessage };
