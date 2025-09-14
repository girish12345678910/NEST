const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  author: {
    type: String, // Clerk user ID
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 280
  },
  mediaUrls: [{
    type: String
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet',
    default: null
  },
  quoteTweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet',
    default: null
  },
  originalTweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet',
    default: null
  },
  tweetType: {
    type: String,
    enum: ['original', 'retweet', 'quote', 'reply'],
    default: 'original'
  },
  likeCount: {
    type: Number,
    default: 0
  },
  retweetCount: {
    type: Number,
    default: 0
  },
  replyCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: String // Clerk user IDs
  }],
  retweetedBy: [{
    type: String // Clerk user IDs
  }]
}, {
  timestamps: true
});

// Indexes
tweetSchema.index({ author: 1, createdAt: -1 });
tweetSchema.index({ createdAt: -1 });
tweetSchema.index({ tweetType: 1 });

// Like methods
tweetSchema.methods.addLike = async function(userId) {
  if (!this.likedBy.includes(userId)) {
    this.likedBy.push(userId);
    this.likeCount = this.likedBy.length;
  }
  return await this.save();
};

tweetSchema.methods.removeLike = async function(userId) {
  this.likedBy = this.likedBy.filter(id => id !== userId);
  this.likeCount = this.likedBy.length;
  return await this.save();
};

// Retweet methods
tweetSchema.methods.addRetweet = async function(userId) {
  if (!this.retweetedBy.includes(userId)) {
    this.retweetedBy.push(userId);
    this.retweetCount = this.retweetedBy.length;
    await this.save();
  }
  
  // Create retweet post
  const Tweet = this.constructor;
  const existingRetweet = await Tweet.findOne({
    author: userId,
    originalTweet: this._id,
    tweetType: 'retweet'
  });
  
  if (!existingRetweet) {
    const retweet = new Tweet({
      author: userId,
      originalTweet: this._id,
      tweetType: 'retweet',
      content: '',
      viewCount: 1
    });
    await retweet.save();
  }
  
  return this;
};

tweetSchema.methods.removeRetweet = async function(userId) {
  this.retweetedBy = this.retweetedBy.filter(id => id !== userId);
  this.retweetCount = this.retweetedBy.length;
  await this.save();
  
  // Remove retweet post
  const Tweet = this.constructor;
  await Tweet.findOneAndDelete({
    author: userId,
    originalTweet: this._id,
    tweetType: 'retweet'
  });
  
  return this;
};

module.exports = mongoose.model('Tweet', tweetSchema);
