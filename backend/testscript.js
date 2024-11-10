const bcrypt = require('bcrypt');
const crypto = require('crypto');
const AdminModel = require('./models/adminModel');

// Your PEPPER value (make sure it matches your .env)
const PEPPER = 'cb5444d330e55ab076fc11eaf47e92aebb891a68caff178e6f7c262ff5c668b5';

const applyPepper = (password) => {
  return crypto
    .createHmac('sha256', PEPPER)
    .update(password)
    .digest('hex');
};

const testPassword = 'admin'; // Replace this with your test password
const pepperedPassword = applyPepper(testPassword);

// Define the async function to handle the logic
const testPasswordComparison = async () => {
  try {
    const admin = await AdminModel.findOne({ username: 'poppy' });

    // Check if admin is found
    if (!admin) {
      console.log('Admin user not found');
      return;
    }

    // Log the stored hashed password
    console.log('Stored password hash:', admin.password);

    // Hash the peppered password with bcrypt (12 salt rounds)
    bcrypt.hash(pepperedPassword, 12, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
      } else {
        console.log('Peppered password hash:', hash);

        // Verify the hash
        bcrypt.compare(pepperedPassword, admin.password, (err, isValid) => {
          if (err) {
            console.error('Error comparing passwords:', err);
          } else {
            console.log('Password comparison result:', isValid);
          }
        });
      }
    });
  } catch (error) {
    console.error('Error finding admin user:', error);
  }
};

// Call the async function
testPasswordComparison();
