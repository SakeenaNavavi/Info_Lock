const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken');
const AdminModel = require('../models/adminModel');

class adminController {
  static PEPPER = process.env.PASSWORD_PEPPER;
  static JWT_SECRET = process.env.JWT_SECRET;
  static SALT_ROUNDS = 12;
  static TRANSIT_KEY = process.env.TRANSIT_KEY;

  static applyPepper(password) {
    return crypto
      .createHmac('sha256', adminController.PEPPER)
      .update(password)
      .digest('hex');
  }

  static decryptTransitPassword(transitPassword) {
    const bytes = CryptoJS.AES.decrypt(transitPassword, this.TRANSIT_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  static generateAdminToken(adminId) {
    return jwt.sign(
      { id: adminId },
      adminController.JWT_SECRET,
      { expiresIn: '1h' }
    );
  };
  static async login(req, res) {
    try {
      const { username, password: transitPassword, securityCode } = req.body;

      // Decrypt the transit-protected password
      const password = adminController.decryptTransitPassword(transitPassword);

      // Find user
      const admin = await AdminModel.findOne({ username });
      if (!admin) {
        return res.status(401).json({ message: 'User does not exist' });
      }

      // Combine password with pepper
      const pepperedPassword = adminController.applyPepper(password);

      // Verify password using stored salt
      const isValid = await bcrypt.compare(pepperedPassword, admin.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      const isValidToken = speakeasy.totp.verify({
        secret: admin.twoFactorSecret, // Assuming `twoFactorSecret` is stored in the admin model
        encoding: 'base32',
        token: securityCode,
        window: 1, // Allows a slight timing variation
      });

      if (!isValidToken) {
        return res.status(401).json({ message: 'Invalid security code' });
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
  static async setupTwoFactor(req, res) {
    try {
      const { adminId } = req.params;

      const secret = speakeasy.generateSecret({
        name: `Admin Portal (${process.env.APP_NAME})`
      });

      await AdminModel.findByIdAndUpdate(adminId, {
        twoFactorSecret: secret.base32
      });

      res.json({
        secret: secret.base32,
        otpauth_url: secret.otpauth_url
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

}
module.exports = adminController;
