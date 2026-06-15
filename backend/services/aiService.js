const ChatSession = require('../models/ChatSession');

class AIService {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.model = 'gpt-4';
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
  }

  async callOpenAI(messages, maxTokens = 500, temperature = 0.7) {
    if (!this.openaiKey || this.openaiKey === 'your_openai_api_key') {
      return this.getFallbackResponse(messages);
    }
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: maxTokens,
          temperature,
        }),
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'I apologize, I could not process that request.';
    } catch (err) {
      console.error('OpenAI API error:', err.message);
      return this.getFallbackResponse(messages);
    }
  }

  getFallbackResponse(messages) {
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
    if (lastMsg.includes('hello') || lastMsg.includes('hi') || lastMsg.includes('hey')) {
      return 'Hello! Welcome to SR Communication. How can I assist you today? You can ask me about our products (smartphones, laptops, accessories), repair services, prices, store hours, or anything else!';
    }
    if (lastMsg.includes('iphone') || lastMsg.includes('apple') || lastMsg.includes('ios')) {
      return 'We have a great selection of iPhones! We carry refurbished iPhone 13, 14, 15, and 16 series models at competitive prices. All our iPhones are 45-point inspected with 1-year warranty. You can browse our full iPhone collection at https://shreerenukamba.com/shop?keyword=iphone or visit us at Guttur Colony, Harihar. Popular models: iPhone 14 (starting ₹49,999), iPhone 15 (starting ₹59,999), iPhone 16 (starting ₹69,999). Visit our store or shop online today!';
    }
    if (lastMsg.includes('samsung') || lastMsg.includes('android') || lastMsg.includes('galaxy')) {
      return 'We offer a wide range of Samsung Galaxy and Android smartphones! From flagship Galaxy S series to budget-friendly A series, all certified refurbished with warranty. Visit https://shreerenukamba.com/shop?keyword=samsung to see our current stock, or come to Guttur Colony, Harihar. Popular models include Galaxy S23, S24, and A-series starting from ₹9,999.';
    }
    if (lastMsg.includes('laptop') || lastMsg.includes('macbook') || lastMsg.includes('mac book')) {
      return 'We have premium refurbished laptops including MacBooks, Dell, HP, and Lenovo. All laptops undergo thorough testing and come with warranty. Starting from ₹19,999. Visit https://shreerenukamba.com/shop?keyword=laptop to see our collection or drop by our store at Guttur Colony, Harihar!';
    }
    if (lastMsg.includes('accessories') || lastMsg.includes('charger') || lastMsg.includes('case') || lastMsg.includes('screen guard') || lastMsg.includes('tempered')) {
      return 'We stock all types of mobile accessories: tempered glass screen guards (₹199-₹899), back cases (₹249-₹799), chargers (₹299-₹1,999), earphones, Bluetooth devices, and more! Visit our store at Guttur Colony, Harihar or shop at https://shreerenukamba.com/shop';
    }
    if (lastMsg.includes('price') || lastMsg.includes('cost') || lastMsg.includes('how much')) {
      return 'Our prices vary by product. Smartphones start from ₹5,999, laptops from ₹19,999, and accessories from ₹199. For the best experience, visit our online store at https://shreerenukamba.com/shop to see current prices and deals, or come to Guttur Colony, Harihar for in-person assistance!';
    }
    if (lastMsg.includes('repair') || lastMsg.includes('fix') || lastMsg.includes('broken') || lastMsg.includes('screen') || lastMsg.includes('battery')) {
      return 'We offer professional repair services for all mobile phones, laptops, and tablets! Common repairs: Screen replacement (₹1,500-₹8,000 depending on model), battery replacement (₹800-₹3,000), charging port repair, water damage diagnosis, and software issues. Book online at https://shreerenukamba.com/dashboard/repairs/new or visit Guttur Colony, Harihar. Most repairs completed within 1-2 hours!';
    }
    if (lastMsg.includes('order') || lastMsg.includes('buy') || lastMsg.includes('purchase') || lastMsg.includes('want')) {
      return 'You can browse and purchase from our full catalog at https://shreerenukamba.com/shop. We offer secure payment, fast delivery, and a 1-year warranty on all products. If you need help choosing a device, tell me what you\'re looking for (budget, brand, features) and I\'ll help you find the perfect match! Also feel free to visit us at Guttur Colony, Harihar.';
    }
    if (lastMsg.includes('address') || lastMsg.includes('location') || lastMsg.includes('map') || lastMsg.includes('where')) {
      return 'We are located at Guttur Colony, Harihar. ⏰ Open Mon-Sat 10AM-8PM, Sunday 11AM-6PM. 📞 Call us at +91 98765 43210. You can also order online at https://shreerenukamba.com/shop for home delivery!';
    }
    if (lastMsg.includes('contact') || lastMsg.includes('phone') || lastMsg.includes('email') || lastMsg.includes('call') || lastMsg.includes('reach')) {
      return 'You can reach us at 📞 +91 98765 43210 or 📧 info@shreerenukamba.com. Visit us at Guttur Colony, Harihar. ⏰ Store hours: Mon-Sat 10AM-8PM, Sunday 11AM-6PM. You can also browse our products at https://shreerenukamba.com/shop';
    }
    if (lastMsg.includes('hour') || lastMsg.includes('open') || lastMsg.includes('time') || lastMsg.includes('timing') || lastMsg.includes('close')) {
      return '⏰ Our store hours: Monday to Saturday: 10:00 AM - 8:00 PM, Sunday: 11:00 AM - 6:00 PM. 📍 Guttur Colony, Harihar. 📞 +91 98765 43210. You can also shop 24/7 at https://shreerenukamba.com/shop';
    }
    if (lastMsg.includes('warranty') || lastMsg.includes('guarantee') || lastMsg.includes('return')) {
      return 'All our refurbished devices come with a 1-year warranty! We also offer a 30-day return policy. Every device undergoes a rigorous 45-point inspection before sale. For repair services, we provide a 90-day warranty on parts and labor. Visit us at Guttur Colony, Harihar for more details!';
    }
    if (lastMsg.includes('thank')) {
      return 'You\'re welcome! 😊 Happy to help. If you have any more questions, feel free to ask. You can visit our store at Guttur Colony, Harihar, call us at +91 98765 43210, or shop online at https://shreerenukamba.com/shop. Have a great day!';
    }
    return 'Thank you for your question! I\'m here to help with information about our products, repair services, pricing, store hours, and more. For specific product details and current stock, please visit our online store at https://shreerenukamba.com/shop or come to our store at Guttur Colony, Harihar. You can also call us at +91 98765 43210 for immediate assistance. How else can I help you?';
  }

  async getLandingPageResponse(sessionId, userMessage) {
    const systemPrompt = `You are a helpful AI assistant for SR Communication (Shree Renukamba Communication), a mobile phone and electronics repair shop and retail store located at Guttur Colony, Harihar.

Your role is to help website visitors with:
1. Information about products (smartphones, laptops, accessories, tempered glass, earphones, etc.)
2. Information about repair services (screen replacement, battery, water damage, etc.)
3. Store hours, location, contact details
4. General inquiries about the business
5. Guiding users to book repairs or shop online

Business Details:
- Name: Shree Renukamba Communication (SR Communication)
- Address: Guttur Colony, Harihar
- Phone: +91 98765 43210
- Email: info@shreerenukamba.com
- Hours: Mon-Sat 10AM-8PM, Sunday 11AM-6PM
- Website: https://shreerenukamba.com
- Services: Mobile repair, laptop repair, tablet repair, sales of smartphones, laptops, accessories, tempered glass, bluetooth devices, earphones

Be friendly, professional, and concise. Use emojis occasionally. Always include store address and phone in relevant responses.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    const reply = await this.callOpenAI(messages, 300, 0.7);
    await this.saveMessage(sessionId, 'user', userMessage);
    await this.saveMessage(sessionId, 'assistant', reply);
    return reply;
  }

  async getCustomerAssistantResponse(sessionId, userMessage, userContext = {}) {
    const contextInfo = userContext.fullName
      ? `The user is ${userContext.fullName} (email: ${userContext.email || 'unknown'}).`
      : 'The user is a customer browsing the dashboard.';

    const systemPrompt = `You are a friendly and helpful AI assistant for SR Communication's customer portal.

${contextInfo}

Your role is to help customers with:
1. Tracking their repair orders and understanding repair status
2. Information about their booked repairs
3. How to book a new repair
4. Navigating the customer dashboard
5. Understanding repair costs, timelines, and processes
6. General product inquiries
7. Store information and contact details

Repair Status Flow: Received → Diagnosis Complete → Waiting For Approval → Repair Started → Parts Ordered → Repair Completed → Ready For Pickup → Delivered

Be empathetic, professional, and helpful. If a customer seems frustrated, be extra supportive. Always offer to connect them with a human agent if needed.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    const reply = await this.callOpenAI(messages, 400, 0.7);
    await this.saveMessage(sessionId, 'user', userMessage);
    await this.saveMessage(sessionId, 'assistant', reply);
    return reply;
  }

  async getAdminAssistantResponse(sessionId, userMessage, analyticsData = {}) {
    const systemPrompt = `You are an expert AI analytics and business assistant for SR Communication's admin panel.

Your role is to help shop administrators with:
1. Business analytics and performance insights
2. Repair queue management and optimization
3. Inventory management suggestions
4. Revenue analysis and trends
5. Customer behavior insights
6. Staff productivity suggestions
7. Operational efficiency recommendations
8. Data-driven decision making

Current Business Context:
- This is a mobile phone repair shop and retail electronics store in Harihar
- Services include phone repair, laptop repair, and retail sales
- The admin manages repairs, inventory, billing, coupons, customers, and orders

Be analytical, data-driven, and provide actionable insights. Use numbers and percentages when available. Be professional and concise. If the admin asks about specific metrics they don't have, suggest what metrics to track.`;

    const analyticsContext = Object.keys(analyticsData).length > 0
      ? `\n\nCurrent Analytics Data:\n${JSON.stringify(analyticsData, null, 2)}`
      : '';

    const messages = [
      { role: 'system', content: systemPrompt + analyticsContext },
      { role: 'user', content: userMessage },
    ];

    const reply = await this.callOpenAI(messages, 500, 0.5);
    await this.saveMessage(sessionId, 'user', userMessage);
    await this.saveMessage(sessionId, 'assistant', reply);
    return reply;
  }

  async analyzeWhatsAppMessage(from, message) {
    const systemPrompt = `You are an AI order processor for SR Communication, a mobile phone and electronics shop in Harihar.

Analyze the customer's WhatsApp message and extract:
1. Intent (order, repair, inquiry, complaint, track, info)
2. Product/Service they want
3. Their name (if mentioned)
4. Any other relevant details

Respond with a JSON object only:
{
  "intent": "order|repair|inquiry|complaint|track|info|greeting|unknown",
  "product": "product name or null",
  "customerName": "name or null",
  "details": "any other relevant details",
  "responseMessage": "a friendly response to the customer"
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    const reply = await this.callOpenAI(messages, 300, 0.3);
    try {
      return JSON.parse(reply);
    } catch {
      return {
        intent: 'unknown',
        product: null,
        customerName: null,
        details: null,
        responseMessage: reply,
      };
    }
  }

  async saveMessage(sessionId, role, content) {
    try {
      const session = await ChatSession.findOne({ sessionId });
      if (session) {
        session.messages.push({ role, content });
        await session.save();
      }
    } catch (err) {
      console.error('Failed to save chat message:', err.message);
    }
  }
}

module.exports = new AIService();
