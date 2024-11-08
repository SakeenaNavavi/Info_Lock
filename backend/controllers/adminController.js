const crypto = require('crypto-js');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const Admin = require('../models/adminModel');

const TRANSIT_KEY = process.env.TRANSIT_KEY;

// Decrypt password received during transit
function decryptPassword(encryptedPassword) {
    try {
      const bytes = crypto.AES.decrypt(encryptedPassword, this.TRANSIT_KEY);
      const decrypted = bytes.toString(crypto.enc.Utf8);
      if (!decrypted) throw new Error("Decryption resulted in empty string");
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error.message);
      throw new Error('Failed to decrypt password');
    }
  }

exports.adminLogin = async (req, res) => {
  const { username, password, securityCode } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Admin with credentials not found!' });
    }

    // Decrypt the password
    const decryptedPassword = decryptPassword(password);

    // Compare decrypted password with hashed password in the database
    const isPasswordValid = await bcrypt.compare(decryptedPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect Password' });
    }

    // Verify 2FA code
    const isValidToken = speakeasy.totp.verify({
      secret: admin.twoFactorSecret,
      encoding: 'base32',
      token: securityCode,
      window: 1,
    });

    if (!isValidToken) {
      return res.status(401).json({ message: 'Invalid security code' });
    }

    // Generate and return JWT token on successful login
    const token = AuthController.generateAdminToken(admin._id);
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
