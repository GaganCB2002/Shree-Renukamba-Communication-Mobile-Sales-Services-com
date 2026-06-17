const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({}).populate('product', 'title price stock');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLowStockItems = async (req, res) => {
  try {
    const items = await Inventory.getLowStock();
    await items.populate('product');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createInventoryItem = async (req, res) => {
  try {
    const { product, stockAvailable, lowStockLimit, supplierDetails } = req.body;

    const existing = await Inventory.findOne({ product });
    if (existing) {
      return res.status(400).json({ message: 'Inventory item already exists for this product' });
    }

    const item = await Inventory.create({
      product,
      stockAvailable,
      lowStockLimit,
      supplierDetails,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateInventoryStock = async (req, res) => {
  try {
    const { stockAvailable, lowStockLimit, supplierDetails } = req.body;
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (stockAvailable !== undefined) item.stockAvailable = stockAvailable;
    if (lowStockLimit !== undefined) item.lowStockLimit = lowStockLimit;
    if (supplierDetails) item.supplierDetails = supplierDetails;

    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInventory,
  getLowStockItems,
  createInventoryItem,
  updateInventoryStock,
};
