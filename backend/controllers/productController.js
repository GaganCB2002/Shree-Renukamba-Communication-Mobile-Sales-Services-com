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

    if (req.query.category) {
      query.category = req.query.category;
    }

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
    const { productId, title, description, category, stock, price, discount, images, specifications, model3d } = req.body;

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
      model3d,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { productId, title, description, category, stock, price, discount, images, specifications, model3d } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.productId = productId !== undefined ? productId : product.productId;
      product.title = title !== undefined ? title : product.title;
      product.description = description !== undefined ? description : product.description;
      product.category = category !== undefined ? category : product.category;
      product.stock = stock !== undefined ? stock : product.stock;
      product.price = price !== undefined ? price : product.price;
      product.discount = discount !== undefined ? discount : product.discount;
      product.images = images !== undefined ? images : product.images;
      product.specifications = specifications !== undefined ? specifications : product.specifications;
      product.model3d = model3d !== undefined ? model3d : product.model3d;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const { pool } = require('../config/db');
      await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search suggestions for auto-complete
// @route   GET /api/products/search-suggestions?keyword=xxx
// @access  Public
const searchSuggestions = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword || keyword.length < 2) {
      return res.json({ products: [], accessories: [] });
    }

    const accessoriesCategory = await Category.findOne({
      categoryName: { $regex: '^accessories$', $options: 'i' },
    });

    const brandModelWords = keyword.split(/\s+/).filter((w) => w.length > 1);

    const accessoryKeywords = [
      ...brandModelWords,
      'screen', 'guard', 'glass', 'case', 'cover', 'back',
      'charger', 'cable', 'adapter', 'power', 'bank', 'battery',
      'earphone', 'headphone', 'buds', 'pod', 'holder', 'stand',
    ];

    const productRegex = brandModelWords.map((w) => `(?=.*${w})`).join('');

    const [products, accessories] = await Promise.all([
      Product.find(
        { title: { $regex: keyword, $options: 'i' } },
        { title: 1, price: 1, discount: 1, images: 1, productId: 1, category: 1 }
      )
        .populate('category', 'categoryName')
        .limit(6)
        .lean(),

      accessoriesCategory
        ? Product.find(
            {
              category: accessoriesCategory._id,
              title: {
                $regex: accessoryKeywords.map((w) => `(?=.*${w})`).join(''),
                $options: 'i',
              },
            },
            { title: 1, price: 1, discount: 1, images: 1, productId: 1, category: 1 }
          )
            .populate('category', 'categoryName')
            .limit(6)
            .lean()
        : Promise.resolve([]),
    ]);

    res.json({ products, accessories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchSuggestions,
};
