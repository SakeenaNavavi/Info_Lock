const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcryptjs');
const OTP = require('../models/otpModel');
const jwt = require('jsonwebtoken');
const AdminModel = require('../models/adminModel');


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
    // Create a test account using Ethereal
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Login OTP Verification',
        html: `
            <h1>OTP Verification</h1>
            <p>Your OTP for login verification is: <strong>${otp}</strong></p>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
        `
    };

    await transporter.sendMail(mailOptions);
}

  static async login(req, res) {
    try {
        const { username, password: transitPassword } = req.body;

        // Decrypt the transit-protected password
        const password = adminController.decryptTransitPassword(transitPassword);

        // Find user
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

        // Generate JWT token
        const token = adminController.generateToken(admin);

        res.json({
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
}
  
}

module.exports = adminController;