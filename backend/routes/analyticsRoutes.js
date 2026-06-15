const express = require('express');
const router = express.Router();
const {
  trackVisit,
  getAnalytics,
  getSearchQueries,
  getAllSearchQueries,
  saveSearchQuery,
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/visit').post(protect, trackVisit);
router.route('/search').post(protect, saveSearchQuery);
router.route('/analytics').get(protect, admin, getAnalytics);
router.route('/search-queries').get(protect, admin, getSearchQueries);
router.route('/all-search-queries').get(protect, admin, getAllSearchQueries);

module.exports = router;
