const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define what a User document looks like
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  bannerUrl: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    maxlength: 100,
    default: ''
  },
  websiteUrl: {
    type: String,
    default: ''
  },
  followerCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  tweetCount: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt
});

// Methods (functions) we can use on User documents

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password for login
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Get public user info (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    displayName: this.displayName,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    bannerUrl: this.bannerUrl,
    location: this.location,
    websiteUrl: this.websiteUrl,
    followerCount: this.followerCount,
    followingCount: this.followingCount,
    tweetCount: this.tweetCount,
    isVerified: this.isVerified,
    isPrivate: this.isPrivate,
    createdAt: this.createdAt
  };
};

// Create and export the model
module.exports = mongoose.model('User', userSchema);
