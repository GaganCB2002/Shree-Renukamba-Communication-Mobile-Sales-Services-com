const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'fallback_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'fallback_key_secret',
});

const createRazorpayOrder = async (amount) => {
  try {
    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_${Math.random() * 10000}`,
    };
    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    throw new Error('Razorpay order creation failed');
  }
};

module.exports = {
  createRazorpayOrder,
  razorpayInstance,
};
