const mongoose = require('mongoose');
const Admin = require('./models/adminModel');
const readline = require('readline');
const crypto = require('crypto');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to the database
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

// Admin creation function
const createAdmin = async () => {
  try {
    console.log('\n=== Admin Creation Debug Info ===');
    
    if (!process.env.PASSWORD_PEPPER) {
      throw new Error('PASSWORD_PEPPER environment variable is not set');
    }
    console.log('\n=== DETAILED ADMIN CREATION DEBUG ===');
    
    // Get admin details from user input
    const username = await promptInput('Enter admin username: ');
    const plainPassword = await promptInput('Enter admin password: ', true);
    const email = await promptInput('Enter admin email: ');

    console.log('\n1. Input Verification:');
    console.log('- Username:', username);
    console.log('- Password length:', plainPassword.length);

    // Apply pepper to the password
    const pepperedPassword = applyPepper(plainPassword);

    // Create admin with the peppered password
    const admin = new Admin({
      username,
      password: pepperedPassword,  // The hashed password will be done in the model's pre-save hook
      email
    });

    // Save the admin to the database
    await admin.save();

    console.log('Admin created successfully');
    rl.close();
  } catch (error) {
    console.error('Error creating admin:', error);
    rl.close();
  }
};

// Helper function to apply pepper to the password
const applyPepper = (password) => {
  if (!process.env.PASSWORD_PEPPER) {
    throw new Error('PASSWORD_PEPPER environment variable is not set');
  }

  // Combine the password with the pepper using HMAC
  return crypto
    .createHmac('sha256', process.env.PASSWORD_PEPPER)
    .update(password)
    .digest('hex');
};

// Prompt function for user input
const promptInput = (question, hideInput = false) => {
  return new Promise((resolve) => {
    rl.question(question, (input) => {
      if (hideInput) {
        console.log('');  // Hides the password input
      }
      resolve(input);
    });
  });
};

// Main execution
(async () => {
  await connectDB();
  await createAdmin();
})();
