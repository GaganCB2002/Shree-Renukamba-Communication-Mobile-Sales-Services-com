const aiService = require('../services/aiService');
const ChatSession = require('../models/ChatSession');
const Repairs = require('../models/RepairOrder');
const Products = require('../models/Product');
const Customers = require('../models/Customer');
const Invoices = require('../models/Invoice');

const chatLanding = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const sid = sessionId || `landing_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    let session = await ChatSession.findOne({ sessionId: sid });
    if (!session) {
      session = await ChatSession.create({
        sessionId: sid,
        source: 'landing',
      });
    }

    const reply = await aiService.getLandingPageResponse(sid, message);
    res.json({ reply, sessionId: sid });
  } catch (err) {
    console.error('Landing AI error:', err.message);
    res.status(500).json({ message: 'Failed to process message' });
  }
};

const chatCustomer = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const sid = sessionId || `customer_${req.user._id}_${Date.now()}`;

    let session = await ChatSession.findOne({ sessionId: sid });
    if (!session) {
      session = await ChatSession.create({
        sessionId: sid,
        userId: req.user._id,
        source: 'web',
      });
    }

    const userContext = {
      fullName: req.user.fullName,
      email: req.user.email,
    };

    const reply = await aiService.getCustomerAssistantResponse(sid, message, userContext);
    res.json({ reply, sessionId: sid });
  } catch (err) {
    console.error('Customer AI error:', err.message);
    res.status(500).json({ message: 'Failed to process message' });
  }
};

const chatAdmin = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const sid = sessionId || `admin_${req.user._id}_${Date.now()}`;

    let session = await ChatSession.findOne({ sessionId: sid });
    if (!session) {
      session = await ChatSession.create({
        sessionId: sid,
        userId: req.user._id,
        source: 'web',
      });
    }

    const [repairs, products, customers, invoices] = await Promise.all([
      Repairs.find(),
      Products.find(),
      Customers.find().populate('userId', 'fullName email'),
      Invoices.find(),
    ]);

    const totalRevenue = invoices
      .filter(i => i.status === 'Paid')
      .reduce((sum, i) => sum + (i.totalAmount || 0), 0);

    const activeRepairs = repairs.filter(r => !['Delivered', 'Cancelled'].includes(r.repairStatus));
    const lowStockProducts = products.filter(p => p.stock <= 5);

    const analyticsData = {
      totalRepairs: repairs.length,
      activeRepairs: activeRepairs.length,
      completedRepairs: repairs.filter(r => r.repairStatus === 'Delivered').length,
      totalRevenue: totalRevenue,
      totalProducts: products.length,
      lowStockItems: lowStockProducts.length,
      totalCustomers: customers.length,
      totalInvoices: invoices.length,
      pendingInvoices: invoices.filter(i => i.status === 'Pending').length,
    };

    const reply = await aiService.getAdminAssistantResponse(sid, message, analyticsData);
    res.json({ reply, sessionId: sid });
  } catch (err) {
    console.error('Admin AI error:', err.message);
    res.status(500).json({ message: 'Failed to process message' });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      return res.json({ messages: [] });
    }
    res.json({ messages: session.messages.slice(-50), session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAdminSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ source: { $ne: 'whatsapp' } })
      .populate('userId', 'fullName email')
      .sort({ updatedAt: -1 })
      .limit(20);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  chatLanding,
  chatCustomer,
  chatAdmin,
  getChatHistory,
  getAdminSessions,
};
