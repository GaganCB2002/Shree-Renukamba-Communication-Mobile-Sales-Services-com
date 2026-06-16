const Invoice = require('../models/Invoice');
const User = require('../models/User');

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private (Admin)
const createInvoice = async (req, res) => {
  try {
    const { customer, repairOrder, order, date, dueDate, status, items, serviceCharge, paymentInstructions } = req.body;

    if (!customer || !dueDate || !items || items.length === 0) {
      return res.status(400).json({ message: 'Customer, due date, and invoice items are required' });
    }

    // Clean and calculate item totals
    const processedItems = items.map(item => {
      const qty = Number(item.qty || 1);
      const unitPrice = Number(item.unitPrice || 0);
      return {
        description: item.description,
        qty,
        unitPrice,
        total: qty * unitPrice
      };
    });

    const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0);
    const svcCharge = Number(serviceCharge || 0);

    // Apply CGST (9%) and SGST (9%)
    const cgst = Math.round(subtotal * 0.09 * 100) / 100;
    const sgst = Math.round(subtotal * 0.09 * 100) / 100;
    const totalAmount = subtotal + cgst + sgst + svcCharge;

    // Generate unique invoice ID: INV-2026-XXXX
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceId = `INV-2026-${randomNum}`;

    const invoice = await Invoice.create({
      invoiceId,
      customer,
      repairOrder: repairOrder || undefined,
      order: order || undefined,
      date: date || undefined,
      dueDate,
      status: status || 'Pending',
      items: processedItems,
      subtotal,
      cgst,
      sgst,
      serviceCharge: svcCharge,
      totalAmount,
      paymentInstructions
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private (Admin)
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({})
      .populate('customer', 'fullName email phoneNumber')
      .populate({
        path: 'repairOrder',
        select: 'repairId device',
        populate: { path: 'device', select: 'brand model' }
      })
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's invoices
// @route   GET /api/invoices/myinvoices
// @access  Private
const getMyInvoices = async (req, res) => {
  try {
    // Invoice model stores customer_id as user_id (see populateInvoice)
    const invoices = await Invoice.find({ customer: req.user._id })
      .populate('customer', 'fullName email phoneNumber')
      .populate({
        path: 'repairOrder',
        select: 'repairId device',
        populate: { path: 'device', select: 'brand model' }
      })
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'fullName email phoneNumber address')
      .populate({
        path: 'repairOrder',
        select: 'repairId device assignedTechnician',
        populate: [
          { path: 'device', select: 'brand model' },
          { path: 'assignedTechnician', select: 'fullName' }
        ]
      });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Access check: Admin/Technician or Invoice Owner
    // Note: Invoice model stores customer_id as user_id (see populateInvoice)
    const isOwner = invoice.customer._id.toString() === req.user._id.toString();
    const isStaff = ['admin', 'technician'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(401).json({ message: 'Not authorized to view this invoice' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update invoice (status, items, amounts, etc.)
// @route   PUT /api/invoices/:id
// @access  Private (Admin)
const updateInvoiceStatus = async (req, res) => {
  try {
    const { status, items, subtotal, cgst, sgst, totalAmount, taxRate, customDuty, serviceCharge } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (status) invoice.status = status;
    if (items) invoice.items = items;
    if (subtotal !== undefined) invoice.subtotal = subtotal;
    if (cgst !== undefined) invoice.cgst = cgst;
    if (sgst !== undefined) invoice.sgst = sgst;
    if (totalAmount !== undefined) invoice.totalAmount = totalAmount;
    if (serviceCharge !== undefined) invoice.serviceCharge = serviceCharge;

    // Recalculate total if items changed but totalAmount not provided
    if (items && totalAmount === undefined) {
      const newSubtotal = items.reduce((s, i) => s + (i.total || Number(i.qty || 0) * Number(i.unitPrice || 0)), 0);
      const rate = taxRate || 18;
      const newCgst = Math.round(newSubtotal * (rate / 2 / 100) * 100) / 100;
      const newSgst = Math.round(newSubtotal * (rate / 2 / 100) * 100) / 100;
      const extra = Number(customDuty || 0);
      const svcCharge = Number(serviceCharge !== undefined ? serviceCharge : invoice.serviceCharge || 0);
      invoice.subtotal = newSubtotal;
      invoice.cgst = newCgst;
      invoice.sgst = newSgst;
      invoice.totalAmount = newSubtotal + newCgst + newSgst + extra + svcCharge;
    }

    const updated = await invoice.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get invoice by order ID
// @route   GET /api/invoices/byorder/:orderId
// @access  Private
const getInvoiceByOrder = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ order: req.params.orderId });
    if (!invoice) {
      return res.status(404).json({ message: 'No invoice found for this order' });
    }
    // Access check
    // Note: Invoice model stores customer_id as user_id (see populateInvoice)
    const isOwner = invoice.customerId?.toString() === req.user._id.toString();
    const isStaff = ['admin', 'technician'].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getMyInvoices,
  getInvoiceById,
  getInvoiceByOrder,
  updateInvoiceStatus
};
