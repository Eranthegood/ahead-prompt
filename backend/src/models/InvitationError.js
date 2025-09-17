import mongoose from 'mongoose';

const InvitationErrorSchema = new mongoose.Schema(
  {
    // Error details
    errorType: { 
      type: String, 
      required: true,
      enum: ['FETCH_FAILED', 'NETWORK_ERROR', 'VALIDATION_ERROR', 'TOKEN_INVALID', 'TOKEN_EXPIRED', 'PERMISSION_DENIED', 'UNKNOWN_ERROR']
    },
    message: { type: String, required: true },
    stack: { type: String },
    
    // User information
    userId: { type: String },
    userEmail: { type: String },
    userAgent: { type: String },
    ipAddress: { type: String },
    
    // Invitation context
    workspaceId: { type: String },
    invitationId: { type: String },
    invitationToken: { type: String }, // Hashed for security
    action: { 
      type: String,
      enum: ['FETCH_INVITATIONS', 'CREATE_INVITATION', 'ACCEPT_INVITATION', 'CANCEL_INVITATION', 'GET_BY_TOKEN'],
      required: true
    },
    
    // Additional context
    requestPath: { type: String },
    responseStatus: { type: Number },
    responseTime: { type: Number }, // in milliseconds
    retryAttempt: { type: Number, default: 0 },
    
    // Metadata
    browserInfo: {
      userAgent: String,
      language: String,
      platform: String,
      cookieEnabled: Boolean,
      onLine: Boolean
    },
    
    // Resolution tracking
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
    resolvedBy: { type: String },
    resolution: { type: String }
  },
  { 
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    // Add indexes for common queries
    index: {
      userId: 1,
      errorType: 1,
      createdAt: -1,
      workspaceId: 1,
      resolved: 1
    }
  }
);

// Add methods for error analysis
InvitationErrorSchema.statics.getErrorStats = function(timeframe = '24h') {
  const now = new Date();
  const startTime = new Date(now.getTime() - (timeframe === '24h' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000));
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startTime } } },
    {
      $group: {
        _id: '$errorType',
        count: { $sum: 1 },
        lastOccurrence: { $max: '$createdAt' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

InvitationErrorSchema.statics.getUserErrorHistory = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

export const InvitationError = mongoose.models.InvitationError || mongoose.model('InvitationError', InvitationErrorSchema);