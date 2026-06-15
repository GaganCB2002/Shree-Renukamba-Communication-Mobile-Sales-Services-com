const express = require('express');
const router = express.Router();
const { getPriceList, updatePriceListItem, bulkUpdatePrices } = require('../controllers/priceListController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getPriceList);
router.route('/bulk').put(protect, admin, bulkUpdatePrices);
router.route('/:id').put(protect, admin, updatePriceListItem);

module.exports = router;
