-- Create NEST database schema
-- This file will run automatically when the container starts

-- Create database extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(500),
  banner_url VARCHAR(500),
  location VARCHAR(100),
  website_url VARCHAR(500),
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  tweet_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tweets table
CREATE TABLE tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) <= 280),
  media_urls TEXT[], 
  reply_to_id UUID REFERENCES tweets(id) ON DELETE CASCADE,
  quote_tweet_id UUID REFERENCES tweets(id) ON DELETE CASCADE,
  thread_id UUID,
  like_count INTEGER DEFAULT 0,
  retweet_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Follows table
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Likes table
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tweet_id UUID REFERENCES tweets(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, tweet_id)
);

-- Retweets table
CREATE TABLE retweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tweet_id UUID REFERENCES tweets(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, tweet_id)
);

-- Performance indexes
CREATE INDEX idx_tweets_user_id ON tweets(user_id);
CREATE INDEX idx_tweets_created_at ON tweets(created_at DESC);
CREATE INDEX idx_tweets_reply_to ON tweets(reply_to_id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_tweet_id ON likes(tweet_id);
CREATE INDEX idx_retweets_user_id ON retweets(user_id);
CREATE INDEX idx_retweets_tweet_id ON retweets(tweet_id);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tweets_updated_at BEFORE UPDATE ON tweets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions to update counts
CREATE OR REPLACE FUNCTION update_tweet_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE tweets SET like_count = like_count + 1 WHERE id = NEW.tweet_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE tweets SET like_count = like_count - 1 WHERE id = OLD.tweet_id;
    END IF;
  END IF;
  
  IF TG_TABLE_NAME = 'retweets' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE tweets SET retweet_count = retweet_count + 1 WHERE id = NEW.tweet_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE tweets SET retweet_count = retweet_count - 1 WHERE id = OLD.tweet_id;
    END IF;
  END IF;
  
  IF TG_TABLE_NAME = 'tweets' AND NEW.reply_to_id IS NOT NULL THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE tweets SET reply_count = reply_count + 1 WHERE id = NEW.reply_to_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER likes_count_trigger 
  AFTER INSERT OR DELETE ON likes 
  FOR EACH ROW EXECUTE FUNCTION update_tweet_counts();

CREATE TRIGGER retweets_count_trigger 
  AFTER INSERT OR DELETE ON retweets 
  FOR EACH ROW EXECUTE FUNCTION update_tweet_counts();

CREATE TRIGGER replies_count_trigger 
  AFTER INSERT ON tweets 
  FOR EACH ROW EXECUTE FUNCTION update_tweet_counts();

-- Insert sample data for testing
INSERT INTO users (username, email, password_hash, display_name, bio) VALUES
('testuser', 'test@nest.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/WZ9g0W0K0Z5Y2xK1G', 'Test User', 'This is a test user for NEST development'),
('johndoe', 'john@nest.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/WZ9g0W0K0Z5Y2xK1G', 'John Doe', 'Software developer and NEST enthusiast'),
('jane_smith', 'jane@nest.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/WZ9g0W0K0Z5Y2xK1G', 'Jane Smith', 'UI/UX Designer building the future');

-- Insert sample tweets
WITH user_ids AS (
  SELECT id, username FROM users WHERE username IN ('testuser', 'johndoe', 'jane_smith')
)
INSERT INTO tweets (user_id, content, view_count) 
SELECT 
  u.id,
  CASE 
    WHEN u.username = 'testuser' THEN 'Welcome to NEST! This is my first tweet on this amazing platform. 🚀'
    WHEN u.username = 'johndoe' THEN 'Building the future of social media, one tweet at a time. The black and silver theme is absolutely stunning! #NEST'
    WHEN u.username = 'jane_smith' THEN 'As a UI/UX designer, I must say NEST has one of the most elegant interfaces I''ve ever seen. The attention to detail is incredible!'
  END,
  FLOOR(RANDOM() * 1000) + 100
FROM user_ids u;

\echo 'NEST database initialized successfully!'
