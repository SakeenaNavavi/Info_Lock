// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const { validateRegistration, validateLogin, adminLoginValidation,validateAdminLoginRequest } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

router.post('/register', validateRegistration, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);
// router.post('/admin-login', adminLoginValidation,validateAdminLoginRequest, AuthController.adminLogin);
router.post('/admin-login',adminLoginValidation, adminController.login);
router.post('/setup-2fa/:adminId', authMiddleware, adminController.setupTwoFactor);

module.exports = router;