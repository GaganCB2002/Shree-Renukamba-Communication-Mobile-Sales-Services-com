const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true,
    },
    stockAvailable: {
      type: Number,
      required: true,
      default: 0,
    },
    lowStockLimit: {
      type: Number,
      required: true,
      default: 5,
    },
    supplierDetails: {
      name: String,
      contact: String,
      email: String,
    },
  },
  {
    timestamps: true,
  }
);

const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;
