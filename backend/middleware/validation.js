const { body } = require('express-validator');
const validateRegistration = (req, res, next) => {
    const { email, password, name, phoneno } = req.body;
  
    if (!email || !password || !name || !phoneno) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }
  
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }
  
    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneno)) {
      return res.status(400).json({
        message: 'Phone number must be 10 digits'
      });
    }
  
    next();
  };
  
  const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }
  
    next();
  };
  
  const adminLoginValidation = [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('securityCode')
      .trim()
      .notEmpty()
      .withMessage('Security code is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('Security code must be 6 digits')
      .isNumeric()
      .withMessage('Security code must contain only numbers')
  ];

  module.exports = {
    adminLoginValidation,
    validateRegistration,
    validateLogin
  };
  