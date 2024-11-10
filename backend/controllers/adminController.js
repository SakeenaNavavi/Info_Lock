const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcryptjs');
const OTP = require('../models/otpModel');
const { sendOtpEmail } = require('../services/emailService');
const jwt = require('jsonwebtoken');
const AdminModel = require('../models/adminModel');


class adminController {
  static PEPPER = process.env.PASSWORD_PEPPER;
  static JWT_SECRET = process.env.JWT_SECRET;
  static SALT_ROUNDS = 12;
  static TRANSIT_KEY = process.env.TRANSIT_KEY;

  static applyPepper(password) {
    if (!this.PEPPER) {
      console.error('PASSWORD_PEPPER environment variable is not set');
      throw new Error('Server configuration error');
    }
    
    console.log('Debug: Password before pepper:', password);
    console.log('Debug: Pepper starts with:', this.PEPPER.substring(0, 4));
    
    const pepperedPassword = crypto
      .createHmac('sha256', this.PEPPER)
      .update(password)
      .digest('hex');
    
    console.log('Debug: Peppered password starts with:', pepperedPassword.substring(0, 4));
    return pepperedPassword;
  }

  static decryptTransitPassword(transitPassword) {
    if (!this.TRANSIT_KEY) {
      console.error('TRANSIT_KEY environment variable is not set');
      throw new Error('Server configuration error');
    }
    try {
      const bytes = CryptoJS.AES.decrypt(transitPassword, this.TRANSIT_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Password decryption failed');
      }
      
      console.log('Debug: Decrypted password length:', decrypted.length);
      return decrypted;
    } catch (error) {
      console.error('Password decryption error:', error);
      throw new Error('Invalid password format');
    }
  }

  static async login(req, res) {
    try {
      const { username, password: transitPassword } = req.body;

      if (!username || !transitPassword) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      console.log('\n=== Login Attempt Debug Info ===');
      
      // Decrypt the transit-protected password
      let password;
      try {
        password = this.decryptTransitPassword(transitPassword);
        console.log('Debug: Successfully decrypted transit password');
      } catch (error) {
        console.error('Decryption error:', error);
        return res.status(400).json({ message: 'Invalid password format' });
      }

      // Find user
      const admin = await AdminModel.findOne({ username });
      if (!admin) {
        // Perform dummy compare to prevent timing attacks
        await bcrypt.compare('dummy', '$2a$10$dummy');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Apply the pepper to the password
      const pepperedPassword = this.applyPepper(password);
      
      console.log('Debug: Authentication steps:');
      console.log('- Peppered password starts with:', pepperedPassword.substring(0, 4));
      console.log('- Stored hash starts with:', admin.password.substring(0, 4));

      // Verify the peppered password against stored hash
      const isValid = await bcrypt.compare(pepperedPassword, admin.password);
      
      console.log('Debug: Password verification result:', isValid);

      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate OTP and send email
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await OTP.create({
        username,
        otp,
        adminId: admin._id,
        expiresAt: otpExpiry
      });

      await sendOtpEmail(admin.email, otp);
      console.log('Debug: OTP generated and sent');

      res.json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async verifyOtp(req, res) {
    try {
      const { username, otp } = req.body;

      // Find OTP record
      const otpRecord = await OTP.findOne({ username, otp });
      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      // Check expiration
      if (otpRecord.expiresAt < Date.now()) {
        return res.status(400).json({ message: 'OTP expired' });
      }

      // OTP is valid, generate JWT token
      const token = adminController.generateAdminToken(otpRecord.adminId); // adminId if saved in OTP

      // Remove OTP record after successful validation
      await OTP.deleteOne({ _id: otpRecord._id });

      res.json({ message: 'Login successful', token });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ message: 'OTP verification failed' });
    }
  }
}

module.exports = adminController;