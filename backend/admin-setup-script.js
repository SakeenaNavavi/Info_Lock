const mongoose = require('mongoose');
const Admin = require('./models/adminModel');
const speakeasy = require('speakeasy');
const readline = require('readline');
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
    const username = await promptInput('Enter admin username: ');
    const password = await promptInput('Enter admin password: ', true);

    // Generate 2FA secret
    const secret = speakeasy.generateSecret({ length: 20 });

    const admin = new Admin({
      username,
      password,
      twoFactorSecret: secret.base32
    });

    await admin.save();

    console.log(`Admin created successfully.`);
    console.log(`2FA Setup:`);
    console.log(`Secret: ${secret.base32}`);
    console.log(`QR Code: ${secret.otpauth_url}`);
    console.log(`Please scan the QR code or enter the secret key in your authenticator app.`);

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