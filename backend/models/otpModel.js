const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // Remove specific ref to allow multiple user types
        refPath: 'userModel'  // Dynamic reference
    },
    userModel: {
        type: String,
        required: true,
        enum: ['User', 'Admin']  // Restrict to these two models
    },
    username: {  
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Add index for faster queries and automatic cleanup
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);