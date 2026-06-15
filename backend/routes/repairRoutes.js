const express = require('express');
const router = express.Router();
const {
  bookRepair,
  getMyRepairs,
  getRepairById,
  updateRepairStatus,
  updateRepairDetails,
  getAllRepairs,
  imeiLookup,
} = require('../controllers/repairController');
const { protect, technician } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, technician, getAllRepairs)
  .post(protect, bookRepair);
router.route('/myrepairs').get(protect, getMyRepairs);
router.route('/imei-lookup').post(protect, imeiLookup);
router.route('/:id').get(protect, getRepairById);
router.route('/:id/status').put(protect, technician, updateRepairStatus);
router.route('/:id/details').put(protect, technician, updateRepairDetails);

module.exports = router;
