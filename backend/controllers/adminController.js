const AdminAuthService = require('../services/adminAuthService');
const AdminModel = require('../models/adminModel');
// const { createLogger } = require('../utils/logger');

const logger = createLogger('AdminAuth');

class adminController {
  static async initiateLogin(req, res) {
    try {
      const { username, password, recaptchaToken } = req.body;

      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Username and password are required'
        });
      }

      // Verify reCAPTCHA
      const isRecaptchaValid = await AdminAuthService.validateRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid reCAPTCHA. Please try again.'
        });
      }

      // Find admin user
      const admin = await AdminModel.findOne({ username });
      if (!admin) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      // Check if account is locked
      if (admin.isLocked && admin.lockUntil > Date.now()) {
        return res.status(423).json({
          status: 'error',
          message: 'Account is locked. Please try again later.',
          lockTime: admin.lockUntil
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        await AdminAuthService.incrementLoginAttempts(admin);
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      // Generate and send OTP
      const otp = await AdminAuthService.generateOTP(admin);
      
      // In production, send OTP via SMS/email
      // await NotificationService.sendOTP(admin.phoneNumber, otp);

      // Create temporary session
      const tempToken = jwt.sign(
        { id: admin._id, stage: 'OTP_PENDING' },
        process.env.JWT_TEMP_SECRET,
        { expiresIn: '5m' }
      );

      res.json({
        status: 'success',
        message: 'OTP sent successfully',
        tempToken
      });

    } catch (error) {
      logger.error('Login initiation failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred during login'
      });
    }
  }

  static async verifyOTP(req, res) {
    try {
      const { otp, tempToken } = req.body;

      if (!otp || !tempToken) {
        return res.status(400).json({
          status: 'error',
          message: 'OTP and temporary token are required'
        });
      }

      // Verify temporary token
      const decoded = jwt.verify(tempToken, process.env.JWT_TEMP_SECRET);
      if (decoded.stage !== 'OTP_PENDING') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid session'
        });
      }

      // Get admin
      const admin = await AdminModel.findById(decoded.id);
      if (!admin) {
        return res.status(404).json({
          status: 'error',
          message: 'Admin not found'
        });
      }

      // Verify OTP
      const isValidOTP = await AdminAuthService.verifyOTP(admin, otp);
      if (!isValidOTP) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid OTP'
        });
      }

      // Reset login attempts
      await AdminModel.updateOne(
        { _id: admin._id },
        {
          $set: {
            loginAttempts: { count: 0, lastAttempt: null },
            isLocked: false,
            lockUntil: null,
            lastLogin: new Date()
          }
        }
      );

      // Generate tokens
      const tokens = AdminAuthService.generateTokens(admin);

      res.json({
        status: 'success',
        message: 'Login successful',
        ...tokens,
        admin: {
          id: admin._id,
          username: admin.username,
          role: admin.role,
          email: admin.email
        }
      });

    } catch (error) {
      logger.error('OTP verification failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred during OTP verification'
      });
    }
  }

  static async logout(req, res) {
    try {
      // In a production environment, you might want to blacklist the token
      // await TokenBlacklist.add(req.token);

      res.json({
        status: 'success',
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred during logout'
      });
    }
  }
}

module.exports = adminController;