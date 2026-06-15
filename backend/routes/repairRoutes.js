const express = require('express');
const router = express.Router();
const { bookRepair, getMyRepairs, updateRepairStatus, getAllRepairs } = require('../controllers/repairController');
const { protect, technician } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, technician, getAllRepairs)
  .post(protect, bookRepair);
router.route('/myrepairs').get(protect, getMyRepairs);
router.route('/:id/status').put(protect, technician, updateRepairStatus);

module.exports = router;
