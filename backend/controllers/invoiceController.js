const Invoice = require('../models/Invoice');
const User = require('../models/User');

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private (Admin)
const createInvoice = async (req, res) => {
  try {
    const { customer, repairOrder, date, dueDate, status, items, paymentInstructions } = req.body;

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

    // Apply CGST (9%) and SGST (9%)
    const cgst = Math.round(subtotal * 0.09 * 100) / 100;
    const sgst = Math.round(subtotal * 0.09 * 100) / 100;
    const totalAmount = subtotal + cgst + sgst;

    // Generate unique invoice ID: INV-2026-XXXX
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceId = `INV-2026-${randomNum}`;

    const invoice = await Invoice.create({
      invoiceId,
      customer,
      repairOrder: repairOrder || undefined,
      date: date || undefined,
      dueDate,
      status: status || 'Pending',
      items: processedItems,
      subtotal,
      cgst,
      sgst,
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

// @desc    Update invoice status
// @route   PUT /api/invoices/:id
// @access  Private (Admin)
const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.status = status || invoice.status;
    const updated = await invoice.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getMyInvoices,
  getInvoiceById,
  updateInvoiceStatus
};
