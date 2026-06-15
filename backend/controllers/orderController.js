const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { sendEmail } = require('../services/emailService');
const { sendEmailNodemailer } = require('../services/nodemailerService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress, paymentMethod } = req.body;

    if (products && products.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    let customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      customer = await Customer.create({ userId: req.user._id });
    }

    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await Order.create({
      orderId,
      customer: customer._id,
      products,
      totalAmount,
      shippingAddress,
      paymentInfo: { method: paymentMethod || 'cod' },
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Pending',
    });

    customer.orderHistory.push(order._id);
    await customer.save();

    // Send order confirmation email with Order ID
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Order Confirmed!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #374151;">Dear <strong>${req.user.fullName || 'Customer'}</strong>,</p>
          <p style="font-size: 16px; color: #374151;">Your order has been placed successfully.</p>
          <div style="background: #4f46e5; color: white; font-size: 24px; font-weight: 800; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 4px; font-family: monospace; margin: 20px 0;">
            ${orderId}
          </div>
          <p style="font-size: 14px; color: #6b7280;">Use this Order ID to track your order anytime on our website.</p>
          <p style="font-size: 14px; color: #374151;">Total: <strong>₹${totalAmount}</strong></p>
          <p style="font-size: 14px; color: #374151;">Thank you for shopping with us!</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({ to: req.user.email, subject: `Order Confirmed - ${orderId}`, html: emailHtml });
    } catch {
      try {
        await sendEmailNodemailer({ to: req.user.email, subject: `Order Confirmed - ${orderId}`, html: emailHtml });
      } catch (e2) {}
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track order by Order ID (public - no auth required)
// @route   GET /api/orders/track/:orderId
// @access  Public
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).populate('customer');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found. Please check your Order ID.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  trackOrder,
};
