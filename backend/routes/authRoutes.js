// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { validateRegistration, validateLogin, adminLoginValidation } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

router.post('/register', validateRegistration, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);
router.post('/admin-login', adminLoginValidation, AuthController.adminLogin);
router.post('/setup-2fa/:adminId', authMiddleware, AuthController.setupTwoFactor);

module.exports = router;