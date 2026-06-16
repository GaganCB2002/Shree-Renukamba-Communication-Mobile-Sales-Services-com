const createOrder = async (amount, currency = 'INR') => {
  return {
    id: `local_${Date.now()}`,
    amount,
    currency,
    status: 'created',
    notes: { local: 'true' }
  };
};

const verifyPayment = async (orderId, paymentId, signature) => {
  return { verified: true, orderId, paymentId };
};

module.exports = { createOrder, verifyPayment };
