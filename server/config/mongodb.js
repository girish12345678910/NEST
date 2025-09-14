const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Remove deprecated options
    await mongoose.connect(process.env.MONGODB_URI, {
      // Only keep these options
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('💡 Check your username, password, and connection string');
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected');
});

module.exports = connectDB;
