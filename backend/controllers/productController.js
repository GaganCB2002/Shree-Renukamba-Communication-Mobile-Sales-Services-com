const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          title: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    let query = { ...keyword };

    if (req.query.categoryName) {
      const category = await Category.findOne({
        categoryName: { $regex: req.query.categoryName, $options: 'i' },
      });
      if (category) {
        query.category = category._id;
      }
    }

    const products = await Product.find(query).populate('category', 'categoryName');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'categoryName');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { productId, title, description, category, stock, price, discount, images, specifications } = req.body;

    const product = await Product.create({
      productId,
      title,
      description,
      category,
      stock,
      price,
      discount,
      images,
      specifications,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
};
