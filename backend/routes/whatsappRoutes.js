const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  verifyWebhook,
  handleIncoming,
  sendMessage,
  sendRepairUpdate,
} = require('../controllers/whatsappController');

router.get('/webhook', verifyWebhook);
router.post('/webhook', handleIncoming);
router.post('/send', protect, admin, sendMessage);
router.post('/repair-update/:repairId', protect, admin, sendRepairUpdate);

module.exports = router;
