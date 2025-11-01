import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    data: {
      type: String, // Base64 encoded image data
    },
    contentType: {
      type: String, // mime type (image/jpeg, image/png, etc.)
    },
    filename: {
      type: String, // original filename
    },
    size: {
      type: Number // file size in bytes
    }
  },
  position: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Member', memberSchema);
