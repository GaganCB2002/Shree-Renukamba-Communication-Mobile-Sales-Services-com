const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  chatLanding,
  chatCustomer,
  chatAdmin,
  getChatHistory,
  getAdminSessions,
} = require('../controllers/aiController');

router.post('/landing', chatLanding);
router.post('/customer', protect, chatCustomer);
router.post('/admin', protect, admin, chatAdmin);
router.get('/history/:sessionId', protect, getChatHistory);
router.get('/sessions', protect, admin, getAdminSessions);

module.exports = router;
