const express = require('express');
const router = express.Router();
const {
  getInventory,
  getLowStockItems,
  createInventoryItem,
  updateInventoryStock,
} = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getInventory).post(protect, admin, createInventoryItem);
router.route('/low-stock').get(protect, admin, getLowStockItems);
router.route('/:id').put(protect, admin, updateInventoryStock);

module.exports = router;
