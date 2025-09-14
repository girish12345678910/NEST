const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import MongoDB connection
const connectDB = require('./config/mongodb');

// Import routes
const authRoutes = require('./routes/auth');
const tweetRoutes = require('./routes/tweets');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Updated CORS for production
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-nest-app.vercel.app', // We'll update this after frontend deployment
    /\.vercel\.app$/ // Allow all Vercel preview deployments
  ],
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tweets', tweetRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'NEST API is running in production!',
    timestamp: new Date().toISOString(),
    database: 'MongoDB Atlas',
    environment: process.env.NODE_ENV || 'production'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 NEST Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🍃 Database: MongoDB Atlas`);
});

module.exports = app;
