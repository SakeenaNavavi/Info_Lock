const mongoose = require('mongoose');

const UserActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: [
      'LOGIN', 
      'LOGOUT', 
      'REGISTRATION', 
      'PASSWORD_CHANGE', 
      'EMAIL_VERIFICATION',
      'OTP_LOGIN'
    ],
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  location: {
    country: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  device: {
    type: {
      browser: String,
      os: String,
      deviceType: String
    }
  },
  success: {
    type: Boolean,
    default: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Create an index for faster querying
UserActivitySchema.index({ user: 1, timestamp: -1 });

const UserActivity = mongoose.model('UserActivity', UserActivitySchema);

module.exports = UserActivity;