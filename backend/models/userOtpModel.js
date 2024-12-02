const mongoose = require('mongoose');

const userOtpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'  // Ensure this references the correct User model
    },
    email: {  
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
userOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 2 });

module.exports = mongoose.model('userOTP', userOtpSchema);