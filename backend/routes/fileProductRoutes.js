const express = require('express');
const router = express.Router();
const { getFileProducts, getFileNewArrivals } = require('../controllers/fileProductController');

router.get('/products', getFileProducts);
router.get('/products/new-arrivals', getFileNewArrivals);

module.exports = router;
