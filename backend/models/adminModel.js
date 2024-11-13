// models/Admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// const adminSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   salt: {
//     type: String,
//     required: true
//   },
//   lastLogin: {
//     type: Date,
//     default: null,
//   },
//   loginAttempts: {
//     type: Number,
//     default: 0,
//   },
//   isLocked: {
//     type: Boolean,
//     default: false,
//   },
//   lockUntil: {
//     type: Date,
//     default: null,
//   },
// }, {
//   timestamps: true,
// });

// // Hash password before saving
// adminSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
  
//   try {
//     console.log("Hashing password for:", this.password); // Debugging
//     const salt = await bcrypt.genSalt(12);
//     this.password = await bcrypt.hash(this.password, salt);
//     console.log("Hashed password:", this.password); // Debugging
//     next();
//   } catch (error) {
//     next(error);
//   }
// });


// // Method to compare passwords
// adminSchema.methods.comparePassword = async function(candidatePassword) {
//   console.log("Comparing:", candidatePassword, this.password); // For debugging
//   return bcrypt.compare(candidatePassword, this.password);
// };


// // Method to handle failed login attempts
// adminSchema.methods.handleFailedLogin = async function() {
//   this.loginAttempts += 1;
  
//   if (this.loginAttempts >= 5) {
//     this.isLocked = true;
//     this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
//   }
  
//   await this.save();
// };

// // Method to reset login attempts
// adminSchema.methods.resetLoginAttempts = async function() {
//   this.loginAttempts = 0;
//   this.isLocked = false;
//   this.lockUntil = null;
//   this.lastLogin = new Date();
//   await this.save();
// };




const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const AdminModel = mongoose.model('Admin', adminSchema);
module.exports = AdminModel;