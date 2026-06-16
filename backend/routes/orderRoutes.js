const express = require('express');
const router = express.Router();
const { addOrderItems, getOrderById, getMyOrders, getAllOrders, trackOrder } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems);
router.route('/all').get(protect, admin, getAllOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/track/:orderId').get(trackOrder);
router.route('/:id').get(protect, getOrderById);

module.exports = router;
