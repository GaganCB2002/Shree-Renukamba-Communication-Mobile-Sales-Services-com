const mongoose = require('mongoose');

const repairOrderSchema = new mongoose.Schema(
  {
    repairId: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
    },
    issueDescription: {
      type: String,
      required: true,
    },
    estimatedCost: {
      type: Number,
    },
    finalCost: {
      type: Number,
    },
    technicianNotes: {
      type: String,
    },
    repairStatus: {
      type: String,
      enum: [
        'Received',
        'Diagnosis Complete',
        'Waiting For Approval',
        'Repair Started',
        'Parts Ordered',
        'Repair Completed',
        'Ready For Pickup',
        'Delivered',
        'Cancelled'
      ],
      default: 'Received',
    },
    repairImages: [
      {
        url: String,
        description: String,
        stage: { type: String, enum: ['Before', 'During', 'After'] }
      },
    ],
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    warrantyExpiresAt: {
      type: Date,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    onHold: {
      type: Boolean,
      default: false,
    },
    holdReason: {
      type: String,
      default: '',
    },
    diagnosisDetails: {
      type: String,
      default: '',
    },
    customerNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const RepairOrder = mongoose.model('RepairOrder', repairOrderSchema);
module.exports = RepairOrder;
