// models/NagrikSeva.js
import mongoose from 'mongoose';

const nagrikSevaHeaderSchema = new mongoose.Schema({
  image: {
    data: String, // Base64 image data
    contentType: String,
    filename: String,
    size: Number
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

const nagrikSevaApplicationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  middleName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  whatsappNumber: {
    type: String,
    required: true
  },
  aadhaarNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  certificateHolderName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  dateOfRegistration: {
    type: Date
  },
  paymentScreenshot: {
    data: String, // Base64 image data
    contentType: String,
    filename: String,
    size: Number
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export const NagrikSevaHeader = mongoose.model('NagrikSevaHeader', nagrikSevaHeaderSchema);
export const NagrikSevaApplication = mongoose.model('NagrikSevaApplication', nagrikSevaApplicationSchema);
