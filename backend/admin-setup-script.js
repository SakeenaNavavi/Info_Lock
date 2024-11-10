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

const createAdmin = async () => {
  try {
    console.log('\n=== Admin Creation Debug Info ===');
    
    if (!process.env.PASSWORD_PEPPER) {
      throw new Error('PASSWORD_PEPPER environment variable is not set');
    }
    
    console.log('1. Environment Variables Check:');
    console.log('- PASSWORD_PEPPER starts with:', process.env.PASSWORD_PEPPER.substring(0, 4));

    const username = await promptInput('Enter admin username: ');
    const plainPassword = await promptInput('Enter admin password: ', true);
    const email = await promptInput('Enter admin email: ');

    console.log('\n2. Password Processing Steps:');
    console.log('- Plain password length:', plainPassword.length);
    
    const pepperedPassword = adminController.applyPepper(plainPassword);
    console.log('- Peppered password length:', pepperedPassword.length);
    console.log('- First 4 chars of peppered result:', pepperedPassword.substring(0, 4));
    
    const hashedPassword = await bcrypt.hash(pepperedPassword, 10); // Changed to 10 rounds
    console.log('- Final hash length:', hashedPassword.length);
    console.log('- First 4 chars of final hash:', hashedPassword.substring(0, 4));

    const admin = new Admin({
      username,
      password: hashedPassword,
      email
    });

    await admin.save();

    console.log('\n3. Admin Created Successfully:');
    console.log('- Username:', username);
    console.log('- Email:', email);
    console.log('- Stored hash length:', hashedPassword.length);
    console.log('- First 4 chars of stored hash:', hashedPassword.substring(0, 4));

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