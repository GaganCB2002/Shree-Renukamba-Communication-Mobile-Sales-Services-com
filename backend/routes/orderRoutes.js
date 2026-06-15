const express = require('express');
const router = express.Router();
const { addOrderItems, getOrderById, trackOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems);
router.route('/track/:orderId').get(trackOrder);
router.route('/:id').get(protect, getOrderById);

module.exports = router;
