const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  getMyInvoices,
  getInvoiceById,
  getInvoiceByOrder,
  updateInvoiceStatus
} = require('../controllers/invoiceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getInvoices)
  .post(protect, admin, createInvoice);

router.route('/myinvoices').get(protect, getMyInvoices);
router.route('/byorder/:orderId').get(protect, getInvoiceByOrder);

router.route('/:id')
  .get(protect, getInvoiceById)
  .put(protect, admin, updateInvoiceStatus);

router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const Invoice = require('../models/Invoice');
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    const { generateInvoicePdf } = require('../services/invoicePdfService');
    const pdfBuffer = await generateInvoicePdf(invoice);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceId || invoice._id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
