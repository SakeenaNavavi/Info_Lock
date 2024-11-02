const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
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
  name: {
    type: String,
    required: true,
    trim: true
  },
  phoneno: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isVerified: 
  { type: Boolean, default: false 
    
  },
  verificationToken: String,
  tokenExpiry: Date
});

// Add index on email field for faster lookups
userSchema.index({ email: 1 });

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;