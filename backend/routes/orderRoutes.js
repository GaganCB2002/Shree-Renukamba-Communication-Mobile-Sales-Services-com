const express = require('express');
const router = express.Router();
const {
  addOrderItems, getOrderById, getMyOrders, getAllOrders, trackOrder,
  updateOrderStatus, updatePaymentStatus, getOrdersByStatus,
  cancelOrder, approveCancelOrder, rejectCancelOrder,
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
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/approve-cancel').put(protect, admin, approveCancelOrder);
router.route('/:id/reject-cancel').put(protect, admin, rejectCancelOrder);

module.exports = router;
