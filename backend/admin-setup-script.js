const mongoose = require('mongoose');
const Admin = require('./models/adminModel');
const speakeasy = require('speakeasy');
const readline = require('readline');
const bcrypt = require('bcrypt');
const adminController = require('./controllers/adminController');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// In admin-setup-script.js
const createAdmin = async () => {
  try {
    console.log('\n=== Admin Creation Debug Info ===');
    
    if (!process.env.PASSWORD_PEPPER) {
      throw new Error('PASSWORD_PEPPER environment variable is not set');
    }
    console.log('\n=== DETAILED ADMIN CREATION DEBUG ===');
    
    const username = await promptInput('Enter admin username: ');
    const plainPassword = await promptInput('Enter admin password: ', true);
    const email = await promptInput('Enter admin email: ');

    console.log('\n1. Input Verification:');
    console.log('- Username:', username);
    console.log('- Password:', plainPassword);
    console.log('- Password length:', plainPassword.length);
    
    console.log('\n2. Environment Check:');
    console.log('- PEPPER available:', !!process.env.PASSWORD_PEPPER);
    console.log('- PEPPER first 4 chars:', process.env.PASSWORD_PEPPER.substring(0, 4));
    
    // Apply pepper - use the exact same function from adminController
    const pepperedPassword = crypto
      .createHmac('sha256', process.env.PASSWORD_PEPPER)
      .update(plainPassword)
      .digest('hex');
    
    console.log('\n3. Pepper Application:');
    console.log('- Plain password:', plainPassword);
    console.log('- Peppered result:', pepperedPassword);
    console.log('- Peppered length:', pepperedPassword.length);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(pepperedPassword, 10);
    
    console.log('\n4. Password Hashing:');
    console.log('- Final hash:', hashedPassword);
    console.log('- Hash prefix:', hashedPassword.substring(0, 7));
    
    // Verify immediately
    const verifyHash = await bcrypt.compare(pepperedPassword, hashedPassword);
    console.log('\n5. Immediate Verification:');
    console.log('- Initial verify result:', verifyHash);
    
    const admin = new Admin({
      username,
      password: hashedPassword,
      email
    });

    await admin.save();
    
    // Verify after save
    const savedAdmin = await Admin.findOne({ username });
    const finalVerify = await bcrypt.compare(pepperedPassword, savedAdmin.password);
    
    console.log('\n6. Post-Save Verification:');
    console.log('- Stored hash:', savedAdmin.password);
    console.log('- Final verify result:', finalVerify);

    rl.close();
  } catch (error) {
    console.error('Error creating admin:', error);
    rl.close();
  }
};

const promptInput = (question, hideInput = false) => {
  return new Promise((resolve) => {
    rl.question(question, (input) => {
      if (hideInput) {
        console.log('');
      }
      resolve(input);
    });
  });
};

(async () => {
  await connectDB();
  await createAdmin();
})();