// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Enhanced startup logging
console.log('Starting server with configuration:', {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI ? '[SET]' : '[NOT SET]',
    JWT_SECRET: process.env.JWT_SECRET ? '[SET]' : '[NOT SET]',
    TRANSIT_KEY: process.env.TRANSIT_KEY ? '[SET]' : '[NOT SET]',
    PASSWORD_PEPPER: process.env.PASSWORD_PEPPER ? '[SET]' : '[NOT SET]'
});

// Middleware with error handling
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// Health check endpoint (add this before other routes)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({ message: 'Route not found' });
});

// MongoDB connection with enhanced error handling
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Successfully connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Start server with proper error handling
const startServer = async () => {
    try {
        await connectDB();
        
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Health check available at: http://localhost:${PORT}/api/health`);
        }).on('error', (err) => {
            console.error('Failed to start server:', err);
            process.exit(1);
        });
    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
};

// Start the server
startServer().catch(error => {
    console.error('Fatal error during startup:', error);
    process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process in production
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit the process in production
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});