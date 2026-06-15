const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    imei: {
      type: String,
      unique: true,
      sparse: true, // Allow nulls/missing for devices where IMEI isn't applicable
    },
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Dead'],
      default: 'Good',
    },
    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Device = mongoose.model('Device', deviceSchema);
module.exports = Device;
