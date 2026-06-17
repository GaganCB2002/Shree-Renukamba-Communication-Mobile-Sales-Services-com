const getAIResponse = async (messages, context = {}) => {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
  if (lastMsg.includes('hello') || lastMsg.includes('hi')) {
    return 'Hello! Welcome to Shree Renukamba Communication. How can I help you today?';
  }
  if (lastMsg.includes('price') || lastMsg.includes('cost')) {
    return 'Please visit our shop page or contact us directly for pricing information.';
  }
  if (lastMsg.includes('track') || lastMsg.includes('order') || lastMsg.includes('repair')) {
    return 'You can track your order by entering your Order/Repair ID in the Track Your Order section on our homepage.';
  }
  if (lastMsg.includes('hours') || lastMsg.includes('open') || lastMsg.includes('timing')) {
    return 'Our business hours are Monday to Saturday, 10:00 AM to 7:00 PM.';
  }
  if (lastMsg.includes('address') || lastMsg.includes('location') || lastMsg.includes('store')) {
    return 'Please visit our Contact page for our store address and location.';
  }
  return 'Thank you for reaching out. Please contact us during business hours for assistance, or visit our store.';
};

const detectIntent = async (message) => {
  const lower = message.toLowerCase();
  if (lower.includes('track') || lower.includes('status') || lower.includes('update')) return 'track';
  if (lower.includes('price') || lower.includes('cost') || lower.includes('quote')) return 'pricing';
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return 'greeting';
  if (lower.includes('hours') || lower.includes('open') || lower.includes('timing')) return 'hours';
  if (lower.includes('address') || lower.includes('location') || lower.includes('where')) return 'location';
  if (lower.includes('repair') || lower.includes('fix') || lower.includes('broken')) return 'repair';
  return 'general';
};

const analyzeWhatsAppMessage = async (from, message) => {
  const intent = await detectIntent(message);
  return { from, message, intent, response: await getAIResponse([{ content: message }]) };
};

module.exports = { getAIResponse, detectIntent, analyzeWhatsAppMessage };
