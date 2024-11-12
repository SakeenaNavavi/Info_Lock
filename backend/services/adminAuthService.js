const bcrypt = require('bcrypt');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const AdminModel = require('../models/adminModel');

class AdminAuthService {
  static LOCK_TIME = 30 * 60 * 1000; // 30 minutes
  static MAX_LOGIN_ATTEMPTS = 5;

  static async validateRecaptcha(token) {
    try {
      const response = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
      );
      return response.data.success;
    } catch (error) {
      console.error('reCAPTCHA verification failed:', error);
      return false;
    }
  }

  static async generateOTP(admin) {
    const token = speakeasy.totp({
      secret: admin.twoFactorSecret,
      encoding: 'base32',
      step: 300 // 5 minute validity
    });

    // In production, you would send this via SMS/email
    return token;
  }

  static async verifyOTP(admin, token) {
    return speakeasy.totp.verify({
      secret: admin.twoFactorSecret,
      encoding: 'base32',
      token: token,
      step: 300,
      window: 1
    });
  }

  static generateTokens(admin) {
    const accessToken = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: admin._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  static async incrementLoginAttempts(admin) {
    const updates = {
      $inc: { 'loginAttempts.count': 1 },
      $set: { 'loginAttempts.lastAttempt': new Date() }
    };

    if (admin.loginAttempts.count + 1 >= this.MAX_LOGIN_ATTEMPTS) {
      updates.$set.isLocked = true;
      updates.$set.lockUntil = new Date(Date.now() + this.LOCK_TIME);
    }

    await AdminModel.updateOne({ _id: admin._id }, updates);
  }
}