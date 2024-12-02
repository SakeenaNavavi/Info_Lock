const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcryptjs');
const OTP = require('../models/adminOtpModel');
const jwt = require('jsonwebtoken');
const AdminModel = require('../models/adminModel');
const sgMail = require('@sendgrid/mail');

class adminController {
  static PEPPER = process.env.PASSWORD_PEPPER;
  static JWT_SECRET = process.env.JWT_SECRET;
  static TRANSIT_KEY = process.env.TRANSIT_KEY;

  static applyPepper(password) {
    return crypto
        .createHmac('sha256', adminController.PEPPER)
        .update(password)
        .digest('hex');
  }

  static decryptTransitPassword(transitPassword) {
    const bytes = CryptoJS.AES.decrypt(transitPassword, adminController.TRANSIT_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  static generateToken(admin) {
    return jwt.sign(
        {
            id: admin._id,
            email: admin.email
        },
        adminController.JWT_SECRET,
        { expiresIn: '2h' }
    );
  }

  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendOTPEmail(email, otp) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Admin Login OTP Verification',  // Updated to specify Admin login
      html: `
        <h1>Admin OTP Verification</h1>
        <p>Your OTP for admin login verification is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
      `
    };

    await sgMail.send(msg);
  }

  static async login(req, res) {
    try {
        const { username, password: transitPassword } = req.body;

        // Decrypt the transit-protected password
        const password = adminController.decryptTransitPassword(transitPassword);

        // Find admin
        const admin = await AdminModel.findOne({ username });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Combine password with pepper
        const pepperedPassword = adminController.applyPepper(password);

        // Verify password using stored salt
        const isValid = await bcrypt.compare(pepperedPassword, admin.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const otp = adminController.generateOTP();
        
        // Create OTP with userModel field
        await OTP.create({
            userId: admin._id,
            username: admin.username,  
            otp: await bcrypt.hash(otp.toString(), 10),  
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });

        console.log('OTP created for admin:', admin.username); 

        // Send OTP email
        await adminController.sendOTPEmail(admin.email, otp);

        res.json({
            message: 'OTP sent to your email',
            userId: admin._id,
            username: admin.username,
        });
    } catch (error) {
        console.error('Login initiation error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
  }

  static async verifyOTP(req, res) {
    try {
        const { username, otp } = req.body;

        const admin = await AdminModel.findOne({ username });
        console.log(admin);

        // Find the latest OTP for the admin user
        const otpRecord = await OTP.findOne({
            username,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        console.log('Found OTP record:', otpRecord ? 'Yes' : 'No'); 

        if (!otpRecord) {
            return res.status(401).json({ message: 'OTP expired or invalid' });
        }

        // Verify OTP
        const isValidOTP = await bcrypt.compare(otp.toString(), otpRecord.otp);
        console.log('OTP validation result:', isValidOTP); 
        if (!isValidOTP) {
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        // Delete used OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        // Find admin and generate token

        if (!admin) {
            return res.status(401).json({ message: 'Admin not found' });
        }

        const token = adminController.generateToken(admin);

        res.json({
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.username,
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Verification failed', error: error.message });
    }
  }
}

module.exports = adminController;