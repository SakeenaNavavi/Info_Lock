const UserModel = require("../models/userModel");
const userOTP = require("../models/userOtpModel");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const nodemailer = require("nodemailer");

class AuthController {
  // These would be stored in environment variables
  static PEPPER = process.env.PASSWORD_PEPPER;
  static JWT_SECRET = process.env.JWT_SECRET;
  static SALT_ROUNDS = 12;
  static TRANSIT_KEY = process.env.TRANSIT_KEY;

  // New constants for email
  static SMTP_HOST = process.env.SMTP_HOST;
  static SMTP_PORT = process.env.SMTP_PORT;
  static SMTP_USER = process.env.SMTP_USER;
  static SMTP_PASS = process.env.SMTP_PASS;
  static APP_URL = process.env.CLIENT_URL;

  // Initialize email transporter
  static getEmailTransporter() {
    return nodemailer.createTransport({
      host: AuthController.SMTP_HOST,
      port: AuthController.SMTP_PORT,
      secure: true,
      auth: {
        user: AuthController.SMTP_USER,
        pass: AuthController.SMTP_PASS,
      },
    });
  }

  static async register(req, res) {
    try {
      const { email, password: transitPassword, name, phoneno } = req.body;

      // Decrypt the transit-protected password
      const password = AuthController.decryptTransitPassword(transitPassword);

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Generate a unique salt for this user
      const salt = await bcrypt.genSalt(AuthController.SALT_ROUNDS);

      // Combine password with pepper
      const pepperedPassword = AuthController.applyPepper(password);

      // Hash the peppered password with the salt
      const hashedPassword = await bcrypt.hash(pepperedPassword, salt);

      // Create new user
      const user = await UserModel.create({
        email,
        password: hashedPassword,
        name,
        phoneno,
        salt,
        verificationToken,
        tokenExpiry,
        isVerified: false,
      });

      // Send verification email
      await AuthController.sendVerificationEmail(user.email, verificationToken);

      res.status(201).json({
        message:
          "Registration successful. Please check your email to verify your account.",
        requiresVerification: true,
        email: user.email,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res
        .status(500)
        .json({ message: "Registration failed", error: error.message });
    }
  }

  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async login(req, res) {
    try {
      const { email, password: transitPassword } = req.body;
  
      // Decrypt the transit-protected password
      const password = AuthController.decryptTransitPassword(transitPassword);
  
      // Find user
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Check if user is verified
      if (!user.isVerified) {
        return res.status(403).json({
          message: "Please verify your email before logging in",
          requiresVerification: true,
          email: user.email,
        });
      }
  
      // Combine password with pepper
      const pepperedPassword = AuthController.applyPepper(password);
  
      // Verify password using stored salt
      const isValid = await bcrypt.compare(pepperedPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const otp = AuthController.generateOTP();
  
      // Extensive logging for OTP creation
      console.log('OTP Creation Debug:');
      console.log('User ID:', user._id);
      console.log('User Email:', user.email);
      console.log('Generated OTP:', otp);
      console.log('Current Timestamp:', new Date());
      console.log('Expiry Timestamp:', new Date(Date.now() + 5 * 60 * 1000));
  
      try {
        const otpRecord = await userOTP.create({
          userId: user._id,
          email: user.email,
          otp: await bcrypt.hash(otp.toString(), 10),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });
  
        console.log('OTP Record Created Successfully:');
        console.log('OTP Record ID:', otpRecord._id);
        console.log('OTP Record Details:', otpRecord);
      } catch (otpCreationError) {
        console.error('Error Creating OTP Record:', otpCreationError);
        return res.status(500).json({ 
          message: "Failed to create OTP record", 
          error: otpCreationError.message 
        });
      }
  
      console.log("OTP created for user:", user.name);
  
      await AuthController.sendOTPEmail(user.email, otp);
  
      res.json({
        message: "OTP sent to your email",
        userId: user._id,
        email: user.email,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed", error: error.message });
    }
  }

  static async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      // Find the user by token and check if it's still valid and not expired
      const user = await UserModel.findOne({
        verificationToken: token,
        tokenExpiry: { $gt: new Date() }, // Ensure token hasn't expired
        isVerified: false, // Only verify if not already verified
      });

      if (!user) {
        console.log("Verification failed: Invalid or expired token");
        return res.status(400).json({
          message:
            "Invalid or expired verification token. Please request a new verification email.",
        });
      }

      // Update user verification status
      user.isVerified = true;
      user.verificationToken = undefined;
      user.tokenExpiry = undefined;
      await user.save();

      console.log(`User ${user.email} verified successfully`);
      res.json({
        message: "Email verified successfully",
        success: true,
      });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({
        message: "Verification failed. Please try again.",
        error: error.message,
      });
    }
  }

  static async resendVerification(req, res) {
    try {
      const { email } = req.body;

      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update user with new token
      user.verificationToken = verificationToken;
      user.tokenExpiry = tokenExpiry;
      await user.save();

      // Send new verification email
      await AuthController.sendVerificationEmail(email, verificationToken);

      console.log(`Verification email resent to ${email}`);
      res.json({
        message: "Verification email has been resent. Please check your inbox.",
        success: true,
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({
        message: "Failed to resend verification email",
        error: error.message,
      });
    }
  }

  static async sendVerificationEmail(email, token) {
    const transporter = AuthController.getEmailTransporter();
    const verificationUrl = `${AuthController.APP_URL}/verify-email/${token}`;

    const mailOptions = {
      from: AuthController.SMTP_USER,
      to: email,
      subject: "Verify your InfoLock account",
      html: `
                <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                    <h2>Welcome to InfoLock!</h2>
                    <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                           style="background-color: #007bff; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 4px; display: inline-block;">
                            Verify Email Address
                        </a>
                    </div>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p>${verificationUrl}</p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create an account, please ignore this email.</p>
                </div>
            `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }
  static async logout(req, res) {
    try {
      // If you're using token blacklisting, implement it here
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed", error: error.message });
    }
  }

  // Apply pepper to password
  static applyPepper(password) {
    return crypto
      .createHmac("sha256", AuthController.PEPPER)
      .update(password)
      .digest("hex");
  }

  // Decrypt password that was protected for transit
  static decryptTransitPassword(transitPassword) {
    const bytes = CryptoJS.AES.decrypt(
      transitPassword,
      AuthController.TRANSIT_KEY
    );
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Generate JWT token
  static generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        userType: "User",
      },
      AuthController.JWT_SECRET,
      { expiresIn: "2h" }
    );
  }

  static async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;
  
      // Extensive Debugging Log
      console.log('OTP Verification Request Details:');
      console.log('Email:', email);
      console.log('OTP Received:', otp);
      console.log('Current Server Time:', new Date());
  
      // Find the user first to ensure email exists
      const user = await UserModel.findOne({ email });
      if (!user) {
        console.log('User not found for email:', email);
        return res.status(401).json({ 
          message: "User not found", 
          details: "No user exists with this email" 
        });
      }
  
      // Comprehensive OTP Record Search
      const allOtpRecords = await userOTP.find({ 
        email,
        // Removed time check to see all records
      }).sort({ createdAt: -1 });
  
      console.log('Total OTP Records Found:', allOtpRecords.length);
      
      // Log details of each OTP record
      allOtpRecords.forEach((record, index) => {
        console.log(`OTP Record ${index + 1}:`);
        console.log('Record ID:', record._id);
        console.log('Created At:', record.createdAt);
        console.log('Expires At:', record.expiresAt);
        console.log('Is Expired:', record.expiresAt < new Date());
      });
  
      // Find valid (non-expired) OTP records
      const validOtpRecords = allOtpRecords.filter(
        record => record.expiresAt > new Date()
      );
  
      console.log('Valid OTP Records:', validOtpRecords.length);
  
      if (validOtpRecords.length === 0) {
        return res.status(401).json({ 
          message: "OTP expired or invalid", 
          details: "No valid OTP records found" 
        });
      }
  
      // Use the most recent valid OTP record
      const otpRecord = validOtpRecords[0];
  
      // Verify OTP
      const isValidOTP = await bcrypt.compare(otp.toString(), otpRecord.otp);
      
      console.log('OTP Validation Result:', isValidOTP);
  
      if (!isValidOTP) {
        return res.status(401).json({ 
          message: "Invalid OTP", 
          details: "OTP does not match recorded hash" 
        });
      }
  
      // Delete the used OTP record
      await userOTP.deleteOne({ _id: otpRecord._id });
  
      // Generate JWT token
      const token = AuthController.generateToken(user);
  
      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ 
        message: "OTP verification failed", 
        error: error.toString(),
        errorStack: error.stack 
      });
    }
  }

  static async sendOTPEmail(email, otp) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: "User Login OTP Verification", // Updated to specify Admin login
      html: `
            <h1>User OTP Verification</h1>
            <p>Your OTP for login verification is: <strong>${otp}</strong></p>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
          `,
    };

    await sgMail.send(msg);
  }
}

// Export the controller
module.exports = AuthController;
