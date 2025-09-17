import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  feedback: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'resolved'],
    default: 'new'
  },
  category: {
    type: String,
    enum: ['bug', 'feature', 'improvement', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for efficient querying
feedbackSchema.index({ timestamp: -1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ category: 1 });

export const Feedback = mongoose.model('Feedback', feedbackSchema);