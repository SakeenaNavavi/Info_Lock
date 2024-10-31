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
  
  module.exports = {
    validateRegistration,
    validateLogin
  };
  