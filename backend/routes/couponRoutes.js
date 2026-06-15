const express = require('express');
const router = express.Router();
const {
  getCoupons,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/public').get(getCoupons);
router.route('/validate').post(protect, validateCoupon);
router.route('/')
  .get(protect, admin, getAllCoupons)
  .post(protect, admin, createCoupon);
router.route('/:id')
  .put(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

module.exports = router;
