const RepairOrder = require('../models/RepairOrder');
const Device = require('../models/Device');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail } = require('../services/emailService');
const { sendEmailNodemailer } = require('../services/nodemailerService');

async function notifyAllAdmins(title, message, type = 'RepairUpdate') {
  try {
    const allUsers = await User.find({});
    const adminUsers = Array.isArray(allUsers) ? allUsers.filter(u => u.role === 'admin' || u.role === 'technician') : [];
    for (const admin of adminUsers) {
      await Notification.create({ user: admin._id, title, message, type });
    }
  } catch (e) {
    console.error('Failed to notify admins:', e.message);
  }
}

const bookRepair = async (req, res) => {
  try {
    const { deviceDetails, issueDescription, selectedIssues } = req.body;

    let customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      customer = await Customer.create({ userId: req.user._id });
    }

    let device = await Device.create({
      customer: customer._id,
      brand: deviceDetails.brand,
      model: deviceDetails.model,
      condition: deviceDetails.condition,
    });
    customer.devices.push(device._id);
    await customer.save();

    const repairId = `REP-${Math.floor(100000 + Math.random() * 900000)}`;

    const repairOrder = await RepairOrder.create({
      repairId,
      customer: customer._id,
      device: device._id,
      issueDescription,
      selectedIssues: selectedIssues || [],
      repairStatus: 'Under Review',
    });

    customer.repairHistory.push(repairOrder._id);
    await customer.save();

    await Notification.create({
      user: req.user._id,
      title: 'Repair Request Submitted',
      message: `Your repair request ${repairId} has been received. We will review and provide a cost estimate shortly.`,
      type: 'RepairUpdate',
    });

    await notifyAllAdmins(
      'New Repair Request',
      `New repair ticket ${repairId} has been created by ${req.user.fullName || 'a customer'}. Review and set cost estimate.`,
      'RepairUpdate'
    );

    res.status(201).json(repairOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

const getRepairById = async (req, res) => {
  try {
    const repair = await RepairOrder.findById(req.params.id)
      .populate('device')
      .populate({
        path: 'customer',
        populate: {
          path: 'userId',
          select: 'fullName email phoneNumber profileImage',
        },
      })
      .populate('assignedTechnician', 'fullName email phoneNumber');

    if (!repair) {
      return res.status(404).json({ message: 'Repair not found' });
    }

    const customer = await Customer.findOne({ userId: req.user._id });
    const isOwner = customer && repair.customer._id.toString() === customer._id.toString();
    const isStaff = req.user.role === 'admin' || req.user.role === 'technician';

    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(repair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRepairStatus = async (req, res) => {
  try {
    const { status, technicianNotes, finalCost } = req.body;

    const repair = await RepairOrder.findById(req.params.id)
      .populate('device')
      .populate({
        path: 'customer',
        populate: {
          path: 'userId',
          select: 'fullName email phoneNumber',
        },
      });

    if (!repair) {
      return res.status(404).json({ message: 'Repair not found' });
    }

    repair.repairStatus = status || repair.repairStatus;
    repair.technicianNotes = technicianNotes || repair.technicianNotes;
    repair.finalCost = finalCost || repair.finalCost;

    const updatedRepair = await repair.save();

    const userEmail = repair.customer?.userId?.email;
    const userName = repair.customer?.userId?.fullName || 'Valued Customer';

    if (userEmail) {
      if (status === 'Repair Completed') {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🔧 Repair Completed!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
              <p style="font-size: 16px; color: #374151;">Dear <strong>${userName}</strong>,</p>
              <p style="font-size: 16px; color: #374151;">Great news! The repair for your device has been completed successfully.</p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <p style="margin: 5px 0;"><strong>Repair ID:</strong> ${repair.repairId}</p>
                <p style="margin: 5px 0;"><strong>Device:</strong> ${repair.device?.brand || ''} ${repair.device?.model || ''}</p>
                <p style="margin: 5px 0;"><strong>Issue:</strong> ${repair.issueDescription}</p>
                ${repair.finalCost ? `<p style="margin: 5px 0;"><strong>Final Cost:</strong> ₹${repair.finalCost}</p>` : ''}
              </div>
              <p style="color: #374151;">Your device is now ready for pickup at our store. Please visit us with your repair ticket ID.</p>
              <p style="color: #374151;">Thank you for choosing Shree Renukamba Communication!</p>
            </div>
            <div style="background: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">Shree Renukamba Communication | Mobile Repair & Sales</p>
            </div>
          </div>
        `;

        try {
          await sendEmail({
            to: userEmail,
            subject: `Repair Completed - ${repair.repairId}`,
            html: emailContent,
          });
        } catch (emailErr) {
          try {
            await sendEmailNodemailer({
              to: userEmail,
              subject: `Repair Completed - ${repair.repairId}`,
              html: emailContent,
            });
          } catch (emailErr2) {
            console.error('Both email services failed for repair completion');
          }
        }

        await Notification.create({
          user: repair.customer.userId._id,
          title: 'Repair Completed',
          message: `Your repair ${repair.repairId} has been completed. Your device is ready for pickup!`,
          type: 'RepairUpdate',
        });
      }

      if (status === 'Delivered') {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">✅ Device Delivered</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
              <p style="font-size: 16px; color: #374151;">Dear <strong>${userName}</strong>,</p>
              <p style="font-size: 16px; color: #374151;">Your device has been delivered. We hope you are satisfied with our service!</p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <p style="margin: 5px 0;"><strong>Repair ID:</strong> ${repair.repairId}</p>
                <p style="margin: 5px 0;"><strong>Device:</strong> ${repair.device?.brand || ''} ${repair.device?.model || ''}</p>
              </div>
              <p style="color: #374151;">We value your feedback. Please share your experience with us!</p>
              <p style="color: #374151;">Thank you for choosing Shree Renukamba Communication!</p>
            </div>
            <div style="background: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">Shree Renukamba Communication | Mobile Repair & Sales</p>
            </div>
          </div>
        `;

        try {
          await sendEmail({
            to: userEmail,
            subject: `Device Delivered - ${repair.repairId}`,
            html: emailContent,
          });
        } catch (emailErr) {
          try {
            await sendEmailNodemailer({
              to: userEmail,
              subject: `Device Delivered - ${repair.repairId}`,
              html: emailContent,
            });
          } catch (emailErr2) {
            console.error('Both email services failed for delivery notification');
          }
        }
      }
    }

    res.json(updatedRepair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllRepairs = async (req, res) => {
  try {
    const repairs = await RepairOrder.find({})
      .populate('device')
      .populate({
        path: 'customer',
        populate: {
          path: 'userId',
          select: 'fullName email phoneNumber profileImage',
        },
      });
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRepairDetails = async (req, res) => {
  try {
    const repair = await RepairOrder.findById(req.params.id);
    if (!repair) {
      return res.status(404).json({ message: 'Repair not found' });
    }

    const {
      expectedDeliveryDate,
      onHold,
      holdReason,
      diagnosisDetails,
      customerNotes,
      estimatedCost,
      finalCost,
      technicianNotes,
      selectedIssues,
    } = req.body;

    if (expectedDeliveryDate !== undefined) repair.expectedDeliveryDate = expectedDeliveryDate;
    if (onHold !== undefined) {
      repair.onHold = onHold;
      if (!onHold) repair.holdReason = '';
    }
    if (holdReason !== undefined) repair.holdReason = holdReason;
    if (diagnosisDetails !== undefined) repair.diagnosisDetails = diagnosisDetails;
    if (customerNotes !== undefined) repair.customerNotes = customerNotes;
    if (estimatedCost !== undefined) repair.estimatedCost = estimatedCost;
    if (finalCost !== undefined) repair.finalCost = finalCost;
    if (technicianNotes !== undefined) repair.technicianNotes = technicianNotes;
    if (selectedIssues !== undefined) repair.selectedIssues = selectedIssues;

    const updatedRepair = await repair.save();

    if (onHold === true) {
      const populated = await RepairOrder.findById(repair._id).populate({
        path: 'customer',
        populate: { path: 'userId', select: 'fullName email' },
      });
      const userEmail = populated?.customer?.userId?.email;
      const userName = populated?.customer?.userId?.fullName || 'Valued Customer';

      await Notification.create({
        user: populated?.customer?.userId?._id,
        title: 'Repair On Hold',
        message: `Your repair ${repair.repairId} has been put on hold. Reason: ${holdReason || 'Parts required'}`,
        type: 'RepairUpdate',
      });

      if (userEmail) {
        const holdEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">⏸️ Repair On Hold</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
              <p style="font-size: 16px; color: #374151;">Dear <strong>${userName}</strong>,</p>
              <p style="font-size: 16px; color: #374151;">Your repair has been temporarily put on hold.</p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <p style="margin: 5px 0;"><strong>Repair ID:</strong> ${repair.repairId}</p>
                <p style="margin: 5px 0;"><strong>Reason:</strong> ${holdReason || 'Parts required'}</p>
                ${expectedDeliveryDate ? `<p style="margin: 5px 0;"><strong>Expected Delivery:</strong> ${new Date(expectedDeliveryDate).toLocaleDateString()}</p>` : ''}
              </div>
              <p style="color: #374151;">We will notify you once the repair resumes. Thank you for your patience.</p>
            </div>
            <div style="background: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">Shree Renukamba Communication</p>
            </div>
          </div>
        `;

        try {
          await sendEmail({ to: userEmail, subject: `Repair On Hold - ${repair.repairId}`, html: holdEmailHtml });
        } catch (e) {
          try {
            await sendEmailNodemailer({ to: userEmail, subject: `Repair On Hold - ${repair.repairId}`, html: holdEmailHtml });
          } catch (e2) {}
        }
      }
    }

    res.json(updatedRepair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const setRepairCost = async (req, res) => {
  try {
    const { estimatedCost, finalCost, diagnosisDetails, expectedDeliveryDate } = req.body;
    const repair = await RepairOrder.findById(req.params.id)
      .populate('device')
      .populate({ path: 'customer', populate: { path: 'userId', select: 'fullName email' } });

    if (!repair) return res.status(404).json({ message: 'Repair not found' });

    if (estimatedCost !== undefined) repair.estimatedCost = estimatedCost;
    if (finalCost !== undefined) repair.finalCost = finalCost;
    if (diagnosisDetails !== undefined) repair.diagnosisDetails = diagnosisDetails;
    if (expectedDeliveryDate !== undefined) repair.expectedDeliveryDate = expectedDeliveryDate;
    repair.repairStatus = 'Awaiting Approval';

    const updated = await repair.save();

    const customerUserId = repair.customer?.userId?._id;
    if (customerUserId) {
      await Notification.create({
        user: customerUserId,
        title: 'Cost Estimate Ready',
        message: `Your repair ${repair.repairId} has been diagnosed. Estimated cost: ₹${estimatedCost || finalCost || 'N/A'}. Please review and approve.`,
        type: 'RepairUpdate',
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const customerAcceptCost = async (req, res) => {
  try {
    const repair = await RepairOrder.findById(req.params.id)
      .populate('device')
      .populate({ path: 'customer', populate: { path: 'userId', select: 'fullName email' } });

    if (!repair) return res.status(404).json({ message: 'Repair not found' });

    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer || repair.customer._id.toString() !== customer._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    repair.repairStatus = 'Approved';
    const updated = await repair.save();

    await notifyAllAdmins(
      'Cost Approved by Customer',
      `Customer approved the cost estimate for repair ${repair.repairId}. Ready to start repair.`,
      'RepairUpdate'
    );

    await Notification.create({
      user: req.user._id,
      title: 'Repair Approved',
      message: `You have approved the cost for repair ${repair.repairId}. We will begin working on your device.`,
      type: 'RepairUpdate',
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelRepair = async (req, res) => {
  try {
    const repair = await RepairOrder.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });

    const customer = await Customer.findOne({ userId: req.user._id });
    const isOwner = customer && repair.customer.toString() === customer._id.toString();
    const isStaff = req.user.role === 'admin' || req.user.role === 'technician';

    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    repair.repairStatus = 'Cancelled';
    const updated = await repair.save();

    await Notification.create({
      user: req.user._id,
      title: 'Repair Cancelled',
      message: `Repair ${repair.repairId} has been cancelled.`,
      type: 'RepairUpdate',
    });

    if (isOwner) {
      await notifyAllAdmins(
        'Repair Cancelled by Customer',
        `Repair ${repair.repairId} has been cancelled by the customer.`,
        'RepairUpdate'
      );
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  bookRepair,
  getMyRepairs,
  getRepairById,
  updateRepairStatus,
  updateRepairDetails,
  getAllRepairs,
  setRepairCost,
  customerAcceptCost,
  cancelRepair,
};
