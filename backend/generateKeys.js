const crypto = require('crypto');

const generateSecureKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

console.log('PASSWORD_PEPPER=', generateSecureKey());
console.log('JWT_SECRET=', generateSecureKey());
console.log('TRANSIT_KEY=', generateSecureKey());
