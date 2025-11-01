import mongoose from 'mongoose';

const awardSchema = new mongoose.Schema({
  name: {
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
  description: {
    type: String,
    trim: true
  },
  awardDate: {
    type: Date,
    default: Date.now
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

export default mongoose.model('Award', awardSchema);
