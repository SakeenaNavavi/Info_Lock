// adminModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  twoFactorSecret: {
    type: String,
    required: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    count: { type: Number, default: 0 },
    lastAttempt: { type: Date }
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockUntil: {
    type: Date
  }
});

// Add index for faster lookups
adminSchema.index({ username: 1 });
adminSchema.index({ email: 1 });

const AdminModel = mongoose.model('Admin', adminSchema);
module.exports = AdminModel;