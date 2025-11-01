import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    data: {
      type: String, // Base64 encoded image data
      required: true
    },
    contentType: {
      type: String, // mime type (image/jpeg, image/png, etc.)
      required: true
    },
    filename: {
      type: String, // original filename
      required: true
    },
    size: {
      type: Number // file size in bytes
    }
  },
  description: {
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

export default mongoose.model('Gallery', gallerySchema);
