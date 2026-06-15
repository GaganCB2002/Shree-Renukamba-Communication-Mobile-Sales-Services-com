const express = require('express');
const router = express.Router();
const { bookRepair, getMyRepairs, updateRepairStatus } = require('../controllers/repairController');
const { protect, technician } = require('../middleware/authMiddleware');

router.route('/').post(protect, bookRepair);
router.route('/myrepairs').get(protect, getMyRepairs);
router.route('/:id/status').put(protect, technician, updateRepairStatus);

module.exports = router;
