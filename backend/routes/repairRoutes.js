const express = require('express');
const router = express.Router();
const {
  bookRepair,
  getMyRepairs,
  getRepairById,
  updateRepairStatus,
  updateRepairDetails,
  getAllRepairs,
  setRepairCost,
  customerAcceptCost,
  cancelRepair,
  approveCancelRepair,
  rejectCancelRepair,
} = require('../controllers/repairController');
const { protect, technician } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, technician, getAllRepairs)
  .post(protect, bookRepair);
router.route('/myrepairs').get(protect, getMyRepairs);
router.route('/:id').get(protect, getRepairById);
router.route('/:id/status').put(protect, technician, updateRepairStatus);
router.route('/:id/details').put(protect, technician, updateRepairDetails);
router.route('/:id/cost').put(protect, technician, setRepairCost);
router.route('/:id/accept-cost').put(protect, customerAcceptCost);
router.route('/:id/cancel').put(protect, cancelRepair);
router.route('/:id/approve-cancel').put(protect, technician, approveCancelRepair);
router.route('/:id/reject-cancel').put(protect, technician, rejectCancelRepair);

module.exports = router;
