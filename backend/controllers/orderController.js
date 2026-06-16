const Order = require('../models/Order');
const RepairOrder = require('../models/RepairOrder');
const Customer = require('../models/Customer');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const User = require('../models/User');

const ORDER_STATUS_FLOW = [
  'Pending',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const { products, totalAmount, subtotal, shippingAddress, paymentMethod, couponCode, couponDiscount } = req.body;

    if (products && products.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    let customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      customer = await Customer.create({ userId: req.user._id });
    }

    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderData = {
      orderId,
      customer: customer._id,
      products,
      totalAmount: totalAmount || 0,
      subtotal: subtotal || totalAmount || 0,
      couponCode: couponCode || '',
      couponDiscount: couponDiscount || 0,
      shippingAddress,
      paymentInfo: { method: paymentMethod || 'cod' },
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Pending',
      orderStatus: 'Pending',
    };

    const order = await Order.create(orderData);

    // Increment coupon usage count if coupon was applied
    if (couponCode) {
      try {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
        if (coupon) {
          coupon.usedCount = (coupon.usedCount || 0) + 1;
          await coupon.save();
        }
      } catch (e) {
        // coupon update is non-critical
      }
    }

    // Notify all admin users
    try {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          userId: admin._id,
          title: 'New Order Placed',
          message: `New order ${orderId} for ₹${totalAmount} is pending approval.`,
          type: 'order',
        });
      }
    } catch (e) {
      // notification is non-critical
    }

    // Send order confirmation email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Order Placed!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #374151;">Dear <strong>${req.user.fullName || 'Customer'}</strong>,</p>
          <p style="font-size: 16px; color: #374151;">Your order has been placed successfully and is pending admin approval.</p>
          <div style="background: #4f46e5; color: white; font-size: 24px; font-weight: 800; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 4px; font-family: monospace; margin: 20px 0;">
            ${orderId}
          </div>
          <p style="font-size: 14px; color: #6b7280;">Use this Order ID to track your order. You will be notified once the admin approves your order.</p>
          <p style="font-size: 14px; color: #374151;">Total: <strong>₹${totalAmount}</strong></p>
          <p style="font-size: 14px; color: #374151;">Thank you for shopping with us!</p>
        </div>
      </div>
    `;

    try {
      const { sendEmail } = require('../services/emailService');
      await sendEmail({ to: req.user.email, subject: `Order Placed - ${orderId}`, html: emailHtml });
    } catch (e) {
      try {
        const { sendEmailNodemailer } = require('../services/nodemailerService');
        await sendEmailNodemailer({ to: req.user.email, subject: `Order Placed - ${orderId}`, html: emailHtml });
      } catch (e2) {}
    }

    // Fetch the full order with customer populated
    const populatedOrder = await Order.findById(order._id).populate('customer');
    res.status(201).json(populatedOrder || order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!ORDER_STATUS_FLOW.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${ORDER_STATUS_FLOW.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = status;
    await order.save();

    // Notify the customer
    try {
      const customerUser = await Customer.findById(order.customerId);
      if (customerUser) {
        await Notification.create({
          userId: customerUser.userId,
          title: 'Order Status Updated',
          message: `Your order ${order.orderId} is now: ${status}`,
          type: 'order',
        });
      }
    } catch (e) {}

    const updated = await Order.findById(order._id).populate('customer');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payment status (admin)
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    const updated = await Order.findById(order._id).populate('customer');
    res.json(updated);
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

// @desc    Get all orders (admin)
// @route   GET /api/orders/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('customer');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    let customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      return res.json([]);
    }
    const orders = await Order.find({ customer: customer._id }).populate('customer');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track order by Order ID (public - no auth required)
// @route   GET /api/orders/track/:orderId
// @access  Public
const trackOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findOne({ orderId }).populate('customer');
    if (order) {
      return res.json(order);
    }
    const repair = await RepairOrder.findOne({ repairId: orderId }).populate('device');
    if (repair) {
      return res.json({
        _id: repair._id,
        orderId: repair.repairId,
        orderStatus: repair.repairStatus,
        createdAt: repair.createdAt,
        totalAmount: repair.finalCost || repair.estimatedCost || 0,
        products: repair.device ? [{ title: `${repair.device.brand || ''} ${repair.device.model || ''}`, quantity: 1, price: repair.finalCost || repair.estimatedCost || 0 }] : [],
        paymentStatus: repair.repairStatus === 'Delivered' ? 'Paid' : 'Pending',
        isRepair: true,
        issueDescription: repair.issueDescription,
        diagnosisDetails: repair.diagnosisDetails,
        estimatedCost: repair.estimatedCost,
        finalCost: repair.finalCost,
        expectedDeliveryDate: repair.expectedDeliveryDate,
        repairImages: repair.repairImages,
        deviceImages: repair.device?.images || [],
      });
    }
    res.status(404).json({ message: 'Order not found. Please check your Order ID.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders by status (admin)
// @route   GET /api/orders/status/:status
// @access  Private/Admin
const getOrdersByStatus = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: req.params.status }).populate('customer');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getAllOrders,
  trackOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getOrdersByStatus,
};
