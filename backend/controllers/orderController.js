const Order = require('../models/Order');
const Customer = require('../models/Customer');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress } = req.body;

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
      paymentStatus: 'Pending',
    });

    customer.orderHistory.push(order._id);
    await customer.save();

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

module.exports = {
  addOrderItems,
  getOrderById,
};
