// config/config.js
require('dotenv').config();

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1h'
  },
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    // from: process.env.EMAIL_FROM
  },
  recaptcha: {
    secretKey: process.env.RECAPTCHA_SECRET_KEY
  },
  mongodb: {
    uri: process.env.MONGODB_URI
  }
};