// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const { loginLimiter, authenticateAdmin } = require('../middleware/auth');
const { validateRegistration, validateLogin} = require('../middleware/validation');

router.post('/register', validateRegistration, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);
router.post('/admin-login',adminController.login);
router.post('/verify-otp', adminController.verifyOtp);
module.exports = router;