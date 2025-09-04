import mongoose from 'mongoose';

const ErrorPromptSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    stack: { type: String },
    source: { type: String, default: 'keyboard' },
    meta: { type: Object, default: {} }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export const ErrorPrompt = mongoose.models.ErrorPrompt || mongoose.model('ErrorPrompt', ErrorPromptSchema);

