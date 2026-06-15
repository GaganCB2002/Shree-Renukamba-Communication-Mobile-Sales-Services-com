const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true,
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: true,
      unique: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    repairOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RepairOrder'
    },
    date: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue', 'Draft'],
      default: 'Pending'
    },
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: true
    },
    cgst: {
      type: Number,
      required: true,
      default: 0
    },
    sgst: {
      type: Number,
      required: true,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paymentInstructions: {
      type: String,
      default: 'Bank Transfer Details:\nBank: HDFC Bank, Koramangala\nAcc Name: Lumina Tech Services Pvt Ltd\nAcc No: 50200012345678\nIFSC: HDFC0000123'
    }
  },
  {
    timestamps: true
  }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
