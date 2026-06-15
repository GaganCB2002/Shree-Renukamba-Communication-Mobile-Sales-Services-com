const RepairOrder = require('../models/RepairOrder');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ChatSession = require('../models/ChatSession');

class WhatsAppService {
  constructor() {
    this.apiVersion = 'v22.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.token = process.env.WHATSAPP_ACCESS_TOKEN;
    this.businessPhone = process.env.WHATSAPP_BUSINESS_PHONE || '+919876543210';
  }

  async sendMessage(to, message) {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to.replace(/\D/g, ''),
          type: 'text',
          text: { body: message },
        }),
      });
      return await response.json();
    } catch (err) {
      console.error('WhatsApp send error:', err.message);
      return { error: err.message };
    }
  }

  async sendTemplate(to, templateName, components = []) {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to.replace(/\D/g, ''),
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components,
          },
        }),
      });
      return await response.json();
    } catch (err) {
      console.error('WhatsApp template error:', err.message);
      return { error: err.message };
    }
  }

  async sendOrderConfirmation(to, orderDetails) {
    const message = `*Order Confirmed!* ✅\n\n` +
      `Hi ${orderDetails.customerName},\n\n` +
      `Your order has been received successfully!\n\n` +
      `*Order ID:* ${orderDetails.orderId}\n` +
      `*Items:* ${orderDetails.items}\n` +
      `*Total:* ₹${orderDetails.total}\n` +
      `*Status:* ${orderDetails.status}\n\n` +
      `We will keep you updated. You can track your order status anytime.\n\n` +
      `Thank you for choosing SR Communication! 🙏\n` +
      `📍 Guttur Colony, Harihar\n` +
      `📞 +91 98765 43210`;

    return this.sendMessage(to, message);
  }

  async sendRepairUpdate(to, repairDetails) {
    const statusEmojis = {
      'Received': '📋',
      'Diagnosis Complete': '🔍',
      'Waiting For Approval': '⏳',
      'Repair Started': '🔧',
      'Parts Ordered': '📦',
      'Repair Completed': '✅',
      'Ready For Pickup': '📢',
      'Delivered': '🎉',
    };

    const emoji = statusEmojis[repairDetails.status] || '🔄';
    const message = `${emoji} *Repair Update - ${repairDetails.status}*\n\n` +
      `Hi ${repairDetails.customerName},\n\n` +
      `Your device repair status has been updated:\n\n` +
      `*Repair ID:* ${repairDetails.repairId}\n` +
      `*Device:* ${repairDetails.device}\n` +
      `*Status:* ${repairDetails.status}\n` +
      `${repairDetails.estimatedCost ? `*Estimated Cost:* ₹${repairDetails.estimatedCost}\n` : ''}` +
      `${repairDetails.expectedDelivery ? `*Expected Delivery:* ${repairDetails.expectedDelivery}\n` : ''}` +
      `${repairDetails.notes ? `\n*Note:* ${repairDetails.notes}\n` : ''}\n` +
      `Thank you for choosing SR Communication! 🙏`;

    return this.sendMessage(to, message);
  }

  async handleIncomingMessage(from, messageBody) {
    const lowerBody = messageBody.toLowerCase().trim();
    const phone = from.replace(/\D/g, '');

    if (lowerBody === 'hi' || lowerBody === 'hello' || lowerBody === 'hey' || lowerBody === 'start') {
      return this.sendWelcomeMenu(phone);
    }

    if (lowerBody.includes('order') || lowerBody.includes('buy') || lowerBody.includes('purchase')) {
      return this.handleOrderInquiry(phone, messageBody);
    }

    if (lowerBody.includes('repair') || lowerBody.includes('fix') || lowerBody.includes('broken') || lowerBody.includes('damage')) {
      return this.handleRepairInquiry(phone, messageBody);
    }

    if (lowerBody.includes('price') || lowerBody.includes('cost') || lowerBody.includes('rate')) {
      return this.handlePriceInquiry(phone, messageBody);
    }

    if (lowerBody.includes('status') || lowerBody.includes('track') || lowerBody.includes('update')) {
      return this.handleStatusInquiry(phone, messageBody);
    }

    if (lowerBody.includes('address') || lowerBody.includes('location') || lowerBody.includes('map') || lowerBody.includes('reach')) {
      return this.sendBusinessInfo(phone);
    }

    if (lowerBody.includes('contact') || lowerBody.includes('phone') || lowerBody.includes('call') || lowerBody.includes('email')) {
      return this.sendContactInfo(phone);
    }

    return this.sendHelpMenu(phone);
  }

  async sendWelcomeMenu(to) {
    const message = `👋 *Welcome to SR Communication!*\n\n` +
      `Your trusted mobile & electronics shop in Harihar.\n\n` +
      `*How can we help you today?*\n\n` +
      `1️⃣ *Place an Order* - Tell us what you need\n` +
      `2️⃣ *Repair Service* - Fix your device\n` +
      `3️⃣ *Check Price* - Get product prices\n` +
      `4️⃣ *Track Status* - Check order/repair status\n` +
      `5️⃣ *📍 Our Address* - Visit our store\n` +
      `6️⃣ *📞 Contact Info* - Reach us\n\n` +
      `Reply with a number or describe what you need!\n` +
      `Example: "I want to buy iPhone 15" or "My screen is broken"`;

    return this.sendMessage(to, message);
  }

  async handleOrderInquiry(to, message) {
    const session = await ChatSession.findOne({ phoneNumber: to, source: 'whatsapp', isResolved: false });
    if (session) {
      session.messages.push({ role: 'user', content: message });
      await session.save();
    }

    const reply = `📦 *Great! Let's place your order.*\n\n` +
      `Please provide these details:\n\n` +
      `1️⃣ *Product Name* - What do you want to buy?\n` +
      `2️⃣ *Quantity* - How many?\n` +
      `3️⃣ *Your Name*\n` +
      `4️⃣ *Delivery Address*\n\n` +
      `Example: "I want 2 iPhone 15 tempered glass, name: John, address: Guttur Colony, Harihar"\n\n` +
      `Or visit our store at 📍 Guttur Colony, Harihar\n` +
      `Shop online: https://shreerenukamba.com/shop`;

    return this.sendMessage(to, reply);
  }

  async handleRepairInquiry(to, message) {
    const reply = `🔧 *Device Repair Service*\n\n` +
      `We repair all types of mobile phones, laptops, and tablets.\n\n` +
      `*Common Repairs:*\n` +
      `• Screen Replacement\n` +
      `• Battery Replacement\n` +
      `• Charging Port Repair\n` +
      `• Water Damage Repair\n` +
      `• Camera Module Fix\n` +
      `• Software Issues\n\n` +
      `To book a repair, please provide:\n` +
      `1️⃣ Device model (e.g., iPhone 14)\n` +
      `2️⃣ Issue description\n` +
      `3️⃣ Your name & phone\n\n` +
      `Or book online: https://shreerenukamba.com/dashboard/repairs/new\n` +
      `Visit store: 📍 Guttur Colony, Harihar`;

    return this.sendMessage(to, reply);
  }

  async handlePriceInquiry(to, message) {
    const reply = `💰 *Price Inquiry*\n\n` +
      `For accurate pricing, please tell us:\n\n` +
      `1️⃣ *Product/Device Model* (e.g., iPhone 15)\n` +
      `2️⃣ *What you need* (e.g., tempered glass, repair, full phone)\n\n` +
      `Or browse our online store:\n` +
      `🛒 https://shreerenukamba.com/shop\n\n` +
      `Visit us: 📍 Guttur Colony, Harihar\n` +
      `Call: 📞 +91 98765 43210`;

    return this.sendMessage(to, reply);
  }

  async handleStatusInquiry(to, message) {
    const customer = await Customer.findOne({ phoneNumber: to }).populate('repairHistory');
    if (!customer) {
      return this.sendMessage(to, `🔍 *No records found*\n\nWe couldn't find any repair or order associated with this number.\n\nPlease provide your Repair ID or Order ID to track status.\n\nOr visit: https://shreerenukamba.com`);
    }

    const activeRepairs = customer.repairHistory.filter(r => !['Delivered', 'Cancelled'].includes(r.repairStatus));
    if (activeRepairs.length === 0) {
      return this.sendMessage(to, `✅ *No active repairs*\n\nYou have no devices currently in service. If you need a repair, reply with your device model and issue!`);
    }

    let statusMessage = `📋 *Your Active Repairs*\n\n`;
    activeRepairs.forEach((r, i) => {
      statusMessage += `${i + 1}. *${r.repairId}*\n`;
      statusMessage += `   Device: ${r.device?.brand || 'Device'}\n`;
      statusMessage += `   Status: ${r.repairStatus}\n`;
      if (r.expectedDeliveryDate) {
        statusMessage += `   Expected: ${new Date(r.expectedDeliveryDate).toLocaleDateString()}\n`;
      }
      statusMessage += `\n`;
    });
    statusMessage += `Track online: https://shreerenukamba.com/dashboard`;

    return this.sendMessage(to, statusMessage);
  }

  async sendBusinessInfo(to) {
    const message = `📍 *Our Location*\n\n` +
      `*Shree Renukamba Communication*\n` +
      `Guttur Colony, Harihar\n` +
      `Karnataka, India\n\n` +
      `🕐 *Business Hours:*\n` +
      `Mon-Sat: 10:00 AM - 8:00 PM\n` +
      `Sunday: 11:00 AM - 6:00 PM\n\n` +
      `📞 Call: +91 98765 43210\n` +
      `📧 Email: info@shreerenukamba.com\n\n` +
      `🔗 https://maps.google.com/?q=Guttur+Colony,+Harihar,+Karnataka`;

    return this.sendMessage(to, message);
  }

  async sendContactInfo(to) {
    const message = `📞 *Contact Us*\n\n` +
      `*Shree Renukamba Communication*\n\n` +
      `📱 *Phone:* +91 98765 43210\n` +
      `📧 *Email:* info@shreerenukamba.com\n` +
      `🌐 *Website:* https://shreerenukamba.com\n\n` +
      `📍 *Address:*\n` +
      `Guttur Colony, Harihar\n\n` +
      `🕐 *Hours:* Mon-Sat 10AM-8PM, Sun 11AM-6PM\n\n` +
      `Follow us on social media for latest deals! 🎉`;

    return this.sendMessage(to, message);
  }

  async sendHelpMenu(to) {
    const message = `🤔 *Need Help?*\n\n` +
      `Here's what you can ask me:\n\n` +
      `• *"Hi"* - Start over\n` +
      `• *"Order"* - Place a new order\n` +
      `• *"Repair"* - Fix your device\n` +
      `• *"Price"* - Check product prices\n` +
      `• *"Status"* - Track order/repair\n` +
      `• *"Address"* - Store location\n` +
      `• *"Contact"* - Get contact info\n\n` +
      `Or visit: https://shreerenukamba.com`;

    return this.sendMessage(to, message);
  }

  verifyWebhook(req) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return challenge;
    }
    throw new Error('Verification failed');
  }
}

module.exports = new WhatsAppService();
