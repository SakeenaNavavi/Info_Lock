// authController.js - Backend controller
const UserModel = require('../models/userModel'); // Update path as necessary
const bcrypt = require('bcrypt');
const cryptojs = require('crypto');
const jwt = require('jsonwebtoken');

class AuthController {
    // These would be stored in environment variables
    static PEPPER = process.env.PASSWORD_PEPPER;
    static JWT_SECRET = process.env.JWT_SECRET;
    static SALT_ROUNDS = 12;
    static TRANSIT_KEY = process.env.TRANSIT_KEY;

    static async register(req, res) {
        try {
            const { email, password: transitPassword, name, phoneno } = req.body;

            // Decrypt the transit-protected password
            const password = this.decryptTransitPassword(transitPassword);

            // Check if user already exists
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Generate a unique salt for this user
            const salt = await bcrypt.genSalt(this.SALT_ROUNDS);

            // Combine password with pepper
            const pepperedPassword = this.applyPepper(password);

            // Hash the peppered password with the salt
            const hashedPassword = await bcrypt.hash(pepperedPassword, salt);

            // Create new user
            const user = await UserModel.create({
                email,
                password: hashedPassword,
                name,
                phoneno,
                salt // Store salt with user record
            });

            // Generate JWT token
            const token = this.generateToken(user);

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name
                }
            });
        } catch (error) {
            console.log('Transit Key:', this.TRANSIT_KEY);
            console.log('Pepper:', this.PEPPER);
            console.log('JWT Secret:', this.JWT_SECRET);
            res.status(500).json({ message: 'Registration failed', error: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, password: transitPassword } = req.body;

            // Decrypt the transit-protected password
            const password = this.decryptTransitPassword(transitPassword);

            // Find user
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Combine password with pepper
            const pepperedPassword = this.applyPepper(password);

            // Verify password using stored salt
            const isValid = await bcrypt.compare(pepperedPassword, user.password);
            if (!isValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = this.generateToken(user);

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Login failed', error: error.message });
        }
    }

    // Apply pepper to password
    static applyPepper(password) {
        return crypto
            .createHmac('sha256', this.PEPPER)
            .update(password)
            .digest('hex');
    }

    // Decrypt password that was protected for transit
    static decryptTransitPassword(transitPassword) {
        const bytes = cryptojs.AES.decrypt(transitPassword, this.TRANSIT_KEY);
        return bytes.toString(cryptojs.enc.Utf8);
    }

    // Generate JWT token
    static generateToken(user) {
        return jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            this.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }
}
module.exports = AuthController;