const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  getMyInvoices,
  getInvoiceById,
  updateInvoiceStatus
} = require('../controllers/invoiceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getInvoices)
  .post(protect, admin, createInvoice);

router.route('/myinvoices').get(protect, getMyInvoices);

router.route('/:id')
  .get(protect, getInvoiceById)
  .put(protect, admin, updateInvoiceStatus);

module.exports = router;
