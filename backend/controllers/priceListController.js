const Product = require('../models/Product');

const getPriceList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePriceListItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, discount, stock } = req.body;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (price !== undefined) product.price = price;
    if (discount !== undefined) product.discount = discount;
    if (stock !== undefined) product.stock = stock;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkUpdatePrices = async (req, res) => {
  try {
    const { updates } = req.body;
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ message: 'Updates array is required' });
    }
    const results = [];
    for (const upd of updates) {
      const { id, price, discount, stock } = upd;
      if (id) {
        const product = await Product.findById(id);
        if (product) {
          if (price !== undefined) product.price = price;
          if (discount !== undefined) product.discount = discount;
          if (stock !== undefined) product.stock = stock;
          await product.save();
          results.push({ id, success: true });
        } else {
          results.push({ id, success: false, reason: 'not found' });
        }
      }
    }
    res.json({ message: `Updated ${results.filter(r => r.success).length} products`, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPriceList, updatePriceListItem, bulkUpdatePrices };
