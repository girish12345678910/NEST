const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { clerkClient } = require('@clerk/clerk-sdk-node');
const Tweet = require('../models/Tweet');

const router = express.Router();

// Get user info from Clerk
const getClerkUserInfo = async (userId) => {
  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    return {
      id: clerkUser.id,
      username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user',
      displayName: (clerkUser.firstName || '') + (clerkUser.lastName ? ` ${clerkUser.lastName}` : '') || clerkUser.username || 'User',
      avatarUrl: clerkUser.imageUrl || null,
      isVerified: clerkUser.publicMetadata?.isVerified || false
    };
  } catch (error) {
    return {
      id: userId,
      username: 'unknown',
      displayName: 'Unknown User',
      avatarUrl: null,
      isVerified: false
    };
  }
};

// Create tweet
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    const tweet = new Tweet({
      author: req.user.id,
      content: content.trim(),
      viewCount: 1,
      tweetType: 'original'
    });

    await tweet.save();
    const authorInfo = await getClerkUserInfo(req.user.id);

    res.status(201).json({
      status: 'success',
      data: {
        tweet: {
          id: tweet._id,
          type: 'original',
          content: tweet.content,
          author: authorInfo,
          mediaUrls: tweet.mediaUrls,
          likeCount: tweet.likeCount,
          retweetCount: tweet.retweetCount,
          replyCount: tweet.replyCount,
          viewCount: tweet.viewCount,
          isLiked: false,
          isRetweeted: false,
          createdAt: tweet.createdAt,
          updatedAt: tweet.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Create tweet error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create tweet'
    });
  }
});

// Get tweets - WITH ENHANCED STATE CHECKING
router.get('/', optionalAuth, async (req, res) => {
  try {
    console.log('=== GET TWEETS REQUEST ===');
    console.log('User ID:', req.user ? req.user.id : 'Not logged in');
    
    const tweets = await Tweet.find({ 
      tweetType: { $in: ['original', 'retweet'] }
    }).sort({ createdAt: -1 }).limit(20);

    console.log('Found tweets:', tweets.length);

    const tweetsWithAuthors = await Promise.all(tweets.map(async (tweet, index) => {
      try {
        console.log(`\n--- PROCESSING TWEET ${index + 1} ---`);
        console.log('Tweet ID:', tweet._id);
        console.log('Tweet Type:', tweet.tweetType);
        
        const authorInfo = await getClerkUserInfo(tweet.author);
        
        if (tweet.tweetType === 'retweet' && tweet.originalTweet) {
          const originalTweet = await Tweet.findById(tweet.originalTweet);
          if (!originalTweet) {
            console.log('❌ Original tweet not found');
            return null;
          }
          
          const originalAuthorInfo = await getClerkUserInfo(originalTweet.author);
          
          // CHECK CURRENT USER'S INTERACTION STATE
          const isLiked = req.user ? originalTweet.likedBy.includes(req.user.id) : false;
          const isRetweeted = req.user ? originalTweet.retweetedBy.includes(req.user.id) : false;
          
          console.log('RETWEET - User interactions:', { isLiked, isRetweeted });

          return {
            id: tweet._id,
            type: 'retweet',
            retweeter: authorInfo,
            retweetedAt: tweet.createdAt,
            originalTweet: {
              id: originalTweet._id,
              content: originalTweet.content,
              author: originalAuthorInfo,
              mediaUrls: originalTweet.mediaUrls,
              likeCount: originalTweet.likeCount,
              retweetCount: originalTweet.retweetCount,
              replyCount: originalTweet.replyCount,
              viewCount: originalTweet.viewCount,
              isLiked,
              isRetweeted,
              createdAt: originalTweet.createdAt
            }
          };
        } else {
          // CHECK CURRENT USER'S INTERACTION STATE
          const isLiked = req.user ? tweet.likedBy.includes(req.user.id) : false;
          const isRetweeted = req.user ? tweet.retweetedBy.includes(req.user.id) : false;
          
          console.log('REGULAR TWEET - User interactions:', { isLiked, isRetweeted });

          return {
            id: tweet._id,
            type: 'original',
            content: tweet.content,
            author: authorInfo,
            mediaUrls: tweet.mediaUrls,
            likeCount: tweet.likeCount,
            retweetCount: tweet.retweetCount,
            replyCount: tweet.replyCount,
            viewCount: tweet.viewCount,
            isLiked,
            isRetweeted,
            createdAt: tweet.createdAt,
            updatedAt: tweet.updatedAt
          };
        }
      } catch (error) {
        console.error('❌ Error processing tweet:', error);
        return null;
      }
    }));

    const validTweets = tweetsWithAuthors.filter(tweet => tweet !== null);

    res.json({
      status: 'success',
      data: {
        tweets: validTweets,
        pagination: {
          currentPage: 1,
          hasMore: false,
          totalReturned: validTweets.length
        }
      }
    });
  } catch (error) {
    console.error('❌ Get tweets error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tweets'
    });
  }
});

// SIMPLE LIKE TOGGLE ENDPOINT
router.post('/:tweetId/like', authenticateToken, async (req, res) => {
  try {
    console.log('=== LIKE TOGGLE ===');
    console.log('Tweet ID:', req.params.tweetId);
    console.log('User ID:', req.user.id);
    
    const tweet = await Tweet.findById(req.params.tweetId);
    if (!tweet) {
      console.log('❌ Tweet not found');
      return res.status(404).json({ status: 'error', message: 'Tweet not found' });
    }

    const isCurrentlyLiked = tweet.likedBy.includes(req.user.id);
    console.log('Currently liked:', isCurrentlyLiked);

    if (isCurrentlyLiked) {
      // Remove like
      console.log('🔄 Removing like...');
      await tweet.removeLike(req.user.id);
      console.log('✅ Like removed');
      
      res.json({
        status: 'success',
        message: 'Tweet unliked',
        data: { likeCount: tweet.likeCount, isLiked: false }
      });
    } else {
      // Add like
      console.log('🔄 Adding like...');
      await tweet.addLike(req.user.id);
      console.log('✅ Like added');
      
      res.json({
        status: 'success',
        message: 'Tweet liked',
        data: { likeCount: tweet.likeCount, isLiked: true }
      });
    }
  } catch (error) {
    console.error('❌ Like toggle error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to toggle like',
      details: error.message 
    });
  }
});

// SIMPLE RETWEET TOGGLE ENDPOINT
router.post('/:tweetId/retweet', authenticateToken, async (req, res) => {
  try {
    console.log('=== RETWEET TOGGLE ===');
    console.log('Tweet ID:', req.params.tweetId);
    console.log('User ID:', req.user.id);
    
    const tweet = await Tweet.findById(req.params.tweetId);
    if (!tweet) {
      console.log('❌ Tweet not found');
      return res.status(404).json({ status: 'error', message: 'Tweet not found' });
    }

    const isCurrentlyRetweeted = tweet.retweetedBy.includes(req.user.id);
    console.log('Currently retweeted:', isCurrentlyRetweeted);

    if (isCurrentlyRetweeted) {
      // Remove retweet
      console.log('🔄 Removing retweet...');
      await tweet.removeRetweet(req.user.id);
      console.log('✅ Retweet removed');
      
      res.json({
        status: 'success',
        message: 'Tweet unretweeted',
        data: { retweetCount: tweet.retweetCount, isRetweeted: false }
      });
    } else {
      // Add retweet
      console.log('🔄 Adding retweet...');
      await tweet.addRetweet(req.user.id);
      console.log('✅ Retweet added');
      
      res.json({
        status: 'success',
        message: 'Tweet retweeted',
        data: { retweetCount: tweet.retweetCount, isRetweeted: true }
      });
    }
  } catch (error) {
    console.error('❌ Retweet toggle error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to toggle retweet',
      details: error.message 
    });
  }
});

// Legacy endpoints - simple redirects
router.delete('/:tweetId/like', authenticateToken, async (req, res) => {
  // Just call the like toggle logic directly
  return router.stack.find(route => 
    route.route.path === '/:tweetId/like' && 
    route.route.methods.post
  ).route.stack[0].handle(req, res);
});

router.delete('/:tweetId/retweet', authenticateToken, async (req, res) => {
  // Just call the retweet toggle logic directly
  return router.stack.find(route => 
    route.route.path === '/:tweetId/retweet' && 
    route.route.methods.post
  ).route.stack[0].handle(req, res);
});

// DEBUG ENDPOINT
router.get('/debug/:tweetId', authenticateToken, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.tweetId);
    
    if (!tweet) {
      return res.status(404).json({ error: 'Tweet not found' });
    }

    const isLiked = tweet.likedBy.includes(req.user.id);
    const isRetweeted = tweet.retweetedBy.includes(req.user.id);

    res.json({
      tweetId: tweet._id,
      author: tweet.author,
      likedBy: tweet.likedBy,
      retweetedBy: tweet.retweetedBy,
      likeCount: tweet.likeCount,
      retweetCount: tweet.retweetCount,
      currentUserId: req.user.id,
      currentUserLiked: isLiked,
      currentUserRetweeted: isRetweeted
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ error: 'Debug failed' });
  }
});

// Get user's tweets by username
router.get('/user/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    res.json({
      status: 'success',
      data: {
        tweets: [],
        user: {
          id: 'unknown',
          username: username,
          displayName: username,
          avatarUrl: null,
          isVerified: false
        },
        pagination: {
          currentPage: 1,
          hasMore: false,
          totalReturned: 0
        }
      }
    });
  } catch (error) {
    console.error('Get user tweets error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user tweets'
    });
  }
});

module.exports = router;
