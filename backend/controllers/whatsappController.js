const whatsappService = require('../services/whatsappService');
const aiService = require('../services/aiService');
const ChatSession = require('../models/ChatSession');
const RepairOrder = require('../models/RepairOrder');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');

const verifyWebhook = (req, res) => {
  try {
    const challenge = whatsappService.verifyWebhook(req);
    res.status(200).send(challenge);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

const handleIncoming = async (req, res) => {
  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== 'text') {
      return res.sendStatus(200);
    }

    const from = message.from;
    const messageBody = message.text.body;

    const sessionId = `whatsapp_${from}`;
    let session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = await ChatSession.create({
        sessionId,
        phoneNumber: from,
        source: 'whatsapp',
      });
    }

    session.messages.push({ role: 'user', content: messageBody });
    await session.save();

    const aiAnalysis = await aiService.analyzeWhatsAppMessage(from, messageBody);

    if (aiAnalysis.intent === 'order') {
      await whatsappService.handleIncomingMessage(from, messageBody);
      const user = await Customer.findOne({ phoneNumber: from }).populate('userId');
      if (user?.userId) {
        await Notification.create({
          user: user.userId._id,
          title: 'WhatsApp Order Inquiry',
          message: `New order inquiry via WhatsApp: ${aiAnalysis.product || messageBody}`,
          type: 'OrderUpdate',
        });
      }
    } else if (aiAnalysis.intent === 'repair') {
      await whatsappService.handleIncomingMessage(from, messageBody);
    } else {
      const response = aiAnalysis.responseMessage || aiAnalysis.details;
      await whatsappService.sendMessage(from, response);
      session.messages.push({ role: 'assistant', content: response });
      await session.save();
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('WhatsApp webhook error:', err.message);
    res.sendStatus(200);
  }
};

const sendMessage = async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ message: 'Phone number and message are required' });
    }
    const result = await whatsappService.sendMessage(to, message);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const sendRepairUpdate = async (req, res) => {
  try {
    const { repairId } = req.params;
    const repair = await RepairOrder.findById(repairId)
      .populate({ path: 'customer', populate: { path: 'userId', select: 'phoneNumber fullName' } });

    if (!repair) {
      return res.status(404).json({ message: 'Repair not found' });
    }

    const phone = repair.customer?.userId?.phoneNumber;
    if (!phone) {
      return res.status(400).json({ message: 'Customer phone number not found' });
    }

    const result = await whatsappService.sendRepairUpdate(phone, {
      customerName: repair.customer?.userId?.fullName || 'Customer',
      repairId: repair.repairId,
      device: `${repair.device?.brand || ''} ${repair.device?.model || ''}`.trim() || 'Device',
      status: repair.repairStatus,
      estimatedCost: repair.finalCost || repair.estimatedCost,
      expectedDelivery: repair.expectedDeliveryDate
        ? new Date(repair.expectedDeliveryDate).toLocaleDateString()
        : null,
      notes: repair.customerNotes,
    });

    await Notification.create({
      user: repair.customer?.userId?._id,
      title: 'WhatsApp Update Sent',
      message: `Repair status update sent via WhatsApp for ${repair.repairId}`,
      type: 'RepairUpdate',
    });

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  verifyWebhook,
  handleIncoming,
  sendMessage,
  sendRepairUpdate,
};
