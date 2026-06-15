const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const ActivityLog = require('../models/ActivityLog');

router.get('/', protect, admin, async (req, res) => {
  try {
    const query = {};
    if (req.query.userId) query.userId = req.query.userId;
    if (req.query.action) query.action = req.query.action;
    if (req.query.resourceType) query.resourceType = req.query.resourceType;
    if (req.query.limit) query.limit = parseInt(req.query.limit);
    query.limit = query.limit || 100;
    const logs = await ActivityLog.find(query);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/', protect, admin, async (req, res) => {
  try {
    await ActivityLog.deleteMany();
    res.json({ message: 'Activity logs cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
