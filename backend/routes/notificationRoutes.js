const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMyNotifications);
router.route('/unread-count').get(protect, getUnreadCount);
router.route('/mark-all-read').put(protect, markAllAsRead);
router.route('/:id/read').put(protect, markAsRead);

module.exports = router;
