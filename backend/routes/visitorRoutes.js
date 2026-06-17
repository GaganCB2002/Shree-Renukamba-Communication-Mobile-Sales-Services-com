const express = require('express');
const router = express.Router();
const {
  trackVisitor,
  getVisitors,
  getVisitorStats,
  getVisitorById,
} = require('../controllers/visitorController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/track').post(trackVisitor);
router.route('/').get(protect, admin, getVisitors);
router.route('/stats').get(protect, admin, getVisitorStats);
router.route('/:id').get(protect, admin, getVisitorById);

module.exports = router;
