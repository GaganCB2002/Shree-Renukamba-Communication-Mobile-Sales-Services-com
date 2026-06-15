const RepairOrder = require('../models/RepairOrder');
const Device = require('../models/Device');
const Customer = require('../models/Customer');

// @desc    Book a new repair
// @route   POST /api/repairs
// @access  Private (Customer)
const bookRepair = async (req, res) => {
  try {
    const { deviceDetails, issueDescription, estimatedCost } = req.body;

    // Find customer by user ID
    let customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      customer = await Customer.create({ userId: req.user._id });
    }

    // Check if device already registered or create a new one
    let device = await Device.findOne({ imei: deviceDetails.imei });
    if (!device || !deviceDetails.imei) {
      device = await Device.create({
        customer: customer._id,
        brand: deviceDetails.brand,
        model: deviceDetails.model,
        imei: deviceDetails.imei,
        condition: deviceDetails.condition,
      });
      // Add device to customer
      customer.devices.push(device._id);
      await customer.save();
    }

    // Generate unique repair ID
    const repairId = `REP-${Math.floor(100000 + Math.random() * 900000)}`;

    const repairOrder = await RepairOrder.create({
      repairId,
      customer: customer._id,
      device: device._id,
      issueDescription,
      estimatedCost,
      repairStatus: 'Received',
    });

    // Add repair to customer history
    customer.repairHistory.push(repairOrder._id);
    await customer.save();

    res.status(201).json(repairOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user repairs
// @route   GET /api/repairs/myrepairs
// @access  Private
const getMyRepairs = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      return res.json([]);
    }

    const repairs = await RepairOrder.find({ customer: customer._id }).populate('device');
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update repair status
// @route   PUT /api/repairs/:id/status
// @access  Private (Admin/Technician)
const updateRepairStatus = async (req, res) => {
  try {
    const { status, technicianNotes, finalCost } = req.body;
    
    const repair = await RepairOrder.findById(req.params.id);

    if (repair) {
      repair.repairStatus = status || repair.repairStatus;
      repair.technicianNotes = technicianNotes || repair.technicianNotes;
      repair.finalCost = finalCost || repair.finalCost;

      const updatedRepair = await repair.save();
      res.json(updatedRepair);
    } else {
      res.status(404).json({ message: 'Repair not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  bookRepair,
  getMyRepairs,
  updateRepairStatus,
};
