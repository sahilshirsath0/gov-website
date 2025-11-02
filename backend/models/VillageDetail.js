// models/VillageDetail.js
import mongoose from 'mongoose';

const villageDetailSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    mr: { type: String, required: true }, // Changed from 'hi' to 'mr' for Marathi
  },
  description: {
    en: { type: String, required: true },
    mr: { type: String, required: true }, // Changed from 'hi' to 'mr' for Marathi
  },
  image: {
    data: String,
    contentType: String,
    filename: String,
    size: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

export default mongoose.model('VillageDetail', villageDetailSchema);
