const path = require('path');
const fs = require('fs');

const productsFilePath = path.join(__dirname, '../database/products.json');
const newArrivalsFilePath = path.join(__dirname, '../database/new-arrivals.json');

const getFileProducts = (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to read products file' });
  }
};

const getFileNewArrivals = (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(newArrivalsFilePath, 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to read new arrivals file' });
  }
};

module.exports = { getFileProducts, getFileNewArrivals };
