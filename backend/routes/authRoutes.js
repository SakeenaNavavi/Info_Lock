// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const { validateRegistration, validateLogin} = require('../middleware/validation');

router.post('/register', validateRegistration, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);
router.post('/admin-login',adminController.login);
router.post('/verify-otp', adminController.verifyOTP);
router.post('/verify-user-otp', AuthController.verifyOTP);
module.exports = router;