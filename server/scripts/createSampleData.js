const mongoose = require('mongoose');
const User = require('../models/User');
const Tweet = require('../models/Tweet');
require('dotenv').config();

const createSampleData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for sample data creation...');
    
    // Clear existing data
    await User.deleteMany({});
    await Tweet.deleteMany({});
    console.log('Cleared existing data...');
    
    // Create sample users
    const users = await User.create([
      {
        username: 'testuser',
        email: 'test@nest.com',
        passwordHash: 'password123',
        displayName: 'Test User',
        bio: 'Welcome to NEST! This is a test account for development.',
        isVerified: true
      },
      {
        username: 'johndoe',
        email: 'john@nest.com', 
        passwordHash: 'password123',
        displayName: 'John Doe',
        bio: 'Software developer and NEST enthusiast 🚀',
        followerCount: 150,
        followingCount: 89
      },
      {
        username: 'jane_smith',
        email: 'jane@nest.com',
        passwordHash: 'password123', 
        displayName: 'Jane Smith',
        bio: 'UI/UX Designer building the future with beautiful interfaces ✨',
        followerCount: 320,
        followingCount: 156,
        isVerified: true
      }
    ]);
    
    console.log(`✅ Created ${users.length} sample users`);
    
    // Create sample tweets
    const tweets = await Tweet.create([
      {
        author: users._id,
        content: 'Welcome to NEST! 🚀 This is the future of social media with a sleek black and silver design. Excited to be here!',
        viewCount: 1250,
        likeCount: 45,
        retweetCount: 12,
        replyCount: 8
      },
      {
        author: users[1]._id,
        content: 'Just finished building an amazing feature for NEST. The real-time updates are incredibly smooth! #WebDev #NEST',
        viewCount: 890,
        likeCount: 67,
        retweetCount: 23,
        replyCount: 15
      },
      {
        author: users[2]._id,
        content: 'The design system for NEST is absolutely stunning 😍 Black and silver theme hits different. Props to the design team!',
        viewCount: 1567,
        likeCount: 89,
        retweetCount: 34,
        replyCount: 22
      },
      {
        author: users._id,
        content: 'Pro tip: The real magic happens when you combine great technology with beautiful design. That\'s what NEST is all about! 💡',
        viewCount: 756,
        likeCount: 34,
        retweetCount: 8,
        replyCount: 5
      }
    ]);
    
    console.log(`✅ Created ${tweets.length} sample tweets`);
    
    // Update user tweet counts
    for (const user of users) {
      const tweetCount = await Tweet.countDocuments({ author: user._id });
      user.tweetCount = tweetCount;
      await user.save();
    }
    
    console.log('✅ Updated user tweet counts');
    console.log('🎉 Sample data created successfully!');
    console.log('\nSample login credentials:');
    console.log('Email: test@nest.com, Password: password123');
    console.log('Email: john@nest.com, Password: password123');
    console.log('Email: jane@nest.com, Password: password123');
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    mongoose.connection.close();
  }
};

createSampleData();
