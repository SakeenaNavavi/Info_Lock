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

  static async login(req, res) {
    try {
      console.log('\n=== Enhanced backend Login Debug Info ===');
      
      const { username, password: transitPassword } = req.body;
      
      console.log('1. Initial Request Data:');
      console.log('- Username:', username);
      console.log('- Encrypted password length:', transitPassword?.length);
  
      // Decrypt the password
      let password;
      try {
        const TRANSIT_KEY = process.env.TRANSIT_KEY;
        console.log('\n2. Decryption Process:');
        console.log('- TRANSIT_KEY available:', !!TRANSIT_KEY);
        console.log('- TRANSIT_KEY first 4 chars:', TRANSIT_KEY?.substring(0, 4));
  
        const bytes = CryptoJS.AES.decrypt(transitPassword, TRANSIT_KEY);
        password = bytes.toString(CryptoJS.enc.Utf8);
  
        console.log('- Decrypted password:', password);
        console.log('- Decrypted password length:', password.length);
      } catch (error) {
        console.error('Decryption failed:', error.message);
        return res.status(400).json({ message: 'Invalid password format' });
      }
  
      // Find admin user
      const admin = await AdminModel.findOne({ username });
      
      console.log('\n3. Database Lookup:');
      console.log('- User found:', !!admin);
      console.log('- Stored hash:', admin?.password);
  
      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Apply pepper to password
      const PEPPER = process.env.PASSWORD_PEPPER;
      console.log('\n4. Pepper Application:');
      console.log('- PEPPER available:', !!PEPPER);
      console.log('- PEPPER first 4 chars:', PEPPER?.substring(0, 4));
  
      const pepperedPassword = crypto
        .createHmac('sha256', PEPPER)
        .update(password)
        .digest('hex');
  
      console.log('- Peppered password:', pepperedPassword);
      console.log('- Peppered password length:', pepperedPassword.length);
  
      console.log('\n5. Password Comparison:');
      console.log('- Stored hash:', admin.password);
      console.log('- New peppered password hash:', await bcrypt.hash(pepperedPassword, 10));
      
      const isValid = await bcrypt.compare(pepperedPassword, admin.password);
      console.log('- Password validation result:', isValid);
  
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      // Generate and send OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await OTP.create({
        username,
        otp,
        adminId: admin._id,
        expiresAt: otpExpiry
      });

      console.log('6. OTP generated and stored successfully');

      await sendOtpEmail(admin.email, otp);
      console.log('7. OTP email sent successfully');

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