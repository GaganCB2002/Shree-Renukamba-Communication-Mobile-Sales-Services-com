const express = require('express');
const router = express.Router();
const {
  addOrderItems, getOrderById, getMyOrders, getAllOrders, trackOrder,
  updateOrderStatus, updatePaymentStatus, getOrdersByStatus
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems);
router.route('/all').get(protect, admin, getAllOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/track/:orderId').get(trackOrder);
router.route('/status/:status').get(protect, admin, getOrdersByStatus);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/payment').put(protect, admin, updatePaymentStatus);
router.route('/:id').get(protect, getOrderById);

module.exports = router;
