// 4. Verification script to test password hashing
// Save as verify-password.js
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

async function verifyPasswordHashing() {
  const testPassword = 'poppy'; // Use the password you're trying to log in with
  
  // Apply pepper (same as in adminController)
  const pepperedPassword = crypto
    .createHmac('sha256', process.env.PASSWORD_PEPPER)
    .update(testPassword)
    .digest('hex');
  
  console.log('Password verification test:');
  console.log('1. Original password:', testPassword);
  console.log('2. Peppered password:', pepperedPassword);
  
  // Create test hash
  const hashedPassword = await bcrypt.hash(pepperedPassword, 10);
  console.log('3. Final hash:', hashedPassword);
  
  // Test verification
  const isValid = await bcrypt.compare(pepperedPassword, hashedPassword);
  console.log('4. Verification test:', isValid ? 'PASSED' : 'FAILED');
}

verifyPasswordHashing();