const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

async function compareHashes() {
  // Test values
  const password = 'poppy';
  const PEPPER = process.env.PASSWORD_PEPPER;
  
  console.log('\n=== HASH COMPARISON TEST ===');
  console.log('1. Input:');
  console.log('- Password:', password);
  console.log('- PEPPER first 4 chars:', PEPPER.substring(0, 4));
  
  // Create pepper hash
  const pepperedPassword = crypto
    .createHmac('sha256', PEPPER)
    .update(password)
    .digest('hex');
    
  console.log('\n2. Pepper Result:');
  console.log('- Peppered password:', pepperedPassword);
  
  // Create multiple hashes
  const hash1 = await bcrypt.hash(pepperedPassword, 10);
  const hash2 = await bcrypt.hash(pepperedPassword, 10);
  
  console.log('\n3. Multiple Hashes of Same Input:');
  console.log('- Hash 1:', hash1);
  console.log('- Hash 2:', hash2);
  
  // Compare both ways
  const compare1 = await bcrypt.compare(pepperedPassword, hash1);
  const compare2 = await bcrypt.compare(pepperedPassword, hash2);
  
  console.log('\n4. Cross Comparisons:');
  console.log('- Compare1 result:', compare1);
  console.log('- Compare2 result:', compare2);
}

compareHashes();