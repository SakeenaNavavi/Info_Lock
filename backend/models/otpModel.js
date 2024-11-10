const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpSchema = new Schema({
  username: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model('OTP', otpSchema);
