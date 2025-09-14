import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Eye } from 'lucide-react';
import { tweetService } from '../services/tweetService';
import { formatDistanceToNow } from 'date-fns';

interface Author {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isVerified: boolean;
}

interface BaseTweet {
  id: string;
  content: string;
  author: Author;
  mediaUrls: string[];
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  viewCount: number;
  isLiked: boolean;
  isRetweeted: boolean;
  createdAt: string;
}

interface OriginalTweet extends BaseTweet {
  type: 'original';
  updatedAt: string;
}

interface RetweetTweet {
  id: string;
  type: 'retweet';
  retweeter: Author;
  retweetedAt: string;
  originalTweet: BaseTweet;
}

type Tweet = OriginalTweet | RetweetTweet;

interface TweetCardProps {
  tweet: Tweet;
  onReply?: (tweet: Tweet) => void;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet, onReply }) => {
  // For retweets, work with the original tweet's data
  const targetTweet = tweet.type === 'retweet' ? tweet.originalTweet : tweet;
  
  const [isLiked, setIsLiked] = useState(targetTweet.isLiked);
  const [isRetweeted, setIsRetweeted] = useState(targetTweet.isRetweeted);
  const [likeCount, setLikeCount] = useState(targetTweet.likeCount);
  const [retweetCount, setRetweetCount] = useState(targetTweet.retweetCount);
  const [isLoading, setIsLoading] = useState(false);

  const formatCount = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    console.log('Like button clicked for tweet:', targetTweet.id);
    
    try {
      setIsLoading(true);
      
      const newIsLiked = !isLiked;
      const newLikeCount = newIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
      
      setIsLiked(newIsLiked);
      setLikeCount(newLikeCount);

      if (newIsLiked) {
        await tweetService.likeTweet(targetTweet.id);
      } else {
        await tweetService.unlikeTweet(targetTweet.id);
      }

    } catch (error: any) {
      console.error('Like error:', error);
      setIsLiked(targetTweet.isLiked);
      setLikeCount(targetTweet.likeCount);
      alert('Failed to like tweet: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetweet = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    console.log('Retweet button clicked for tweet:', targetTweet.id);
    
    try {
      setIsLoading(true);
      
      const newIsRetweeted = !isRetweeted;
      const newRetweetCount = newIsRetweeted ? retweetCount + 1 : Math.max(0, retweetCount - 1);
      
      setIsRetweeted(newIsRetweeted);
      setRetweetCount(newRetweetCount);

      if (newIsRetweeted) {
        await tweetService.retweetTweet(targetTweet.id);
      } else {
        await tweetService.unretweetTweet(targetTweet.id);
      }

      // Refresh the page after retweet to show the new retweet post
      window.location.reload();

    } catch (error: any) {
      console.error('Retweet error:', error);
      setIsRetweeted(targetTweet.isRetweeted);
      setRetweetCount(targetTweet.retweetCount);
      alert('Failed to retweet: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="bg-gray-900 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors">
      {/* Retweet Header */}
      {tweet.type === 'retweet' && (
        <div className="flex items-center space-x-2 mb-3 text-gray-400 text-sm">
          <Repeat2 size={16} className="text-green-400" />
          <span>
            <span className="font-semibold">{tweet.retweeter.displayName}</span> retweeted
          </span>
          <time className="text-gray-500">
            {formatDistanceToNow(new Date(tweet.retweetedAt), { addSuffix: true })}
          </time>
        </div>
      )}
      
      <div className="flex space-x-3">
        {/* User Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-black font-bold">
            {targetTweet.author.displayName.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Tweet Header */}
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-gray-200 truncate">
              {targetTweet.author.displayName}
            </h3>
            {targetTweet.author.isVerified && (
              <div className="w-4 h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                <span className="text-black text-xs">✓</span>
              </div>
            )}
            <span className="text-gray-500 truncate">@{targetTweet.author.username}</span>
            <span className="text-gray-500">·</span>
            <time className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(targetTweet.createdAt), { addSuffix: true })}
            </time>
            
            <button className="ml-auto text-gray-500 hover:text-gray-300 p-1 rounded-full hover:bg-gray-800">
              <MoreHorizontal size={16} />
            </button>
          </div>
          
          {/* Tweet Content */}
          <div className="mt-2">
            <p className="text-gray-200 whitespace-pre-wrap break-words">
              {targetTweet.content}
            </p>
          </div>
          
          {/* Tweet Actions */}
          <div className="flex items-center justify-between mt-4 max-w-md">
            {/* Reply */}
            <button
              onClick={() => onReply?.(tweet)}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-400 transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-400/10">
                <MessageCircle size={18} />
              </div>
              {targetTweet.replyCount > 0 && (
                <span className="text-sm">{formatCount(targetTweet.replyCount)}</span>
              )}
            </button>
            
            {/* Retweet */}
            <button
              onClick={handleRetweet}
              disabled={isLoading}
              className={`flex items-center space-x-2 transition-colors group ${
                isRetweeted ? 'text-green-400' : 'text-gray-500 hover:text-green-400'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="p-2 rounded-full group-hover:bg-green-400/10">
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Repeat2 size={18} />
                )}
              </div>
              {retweetCount > 0 && (
                <span className="text-sm">{formatCount(retweetCount)}</span>
              )}
            </button>
            
            {/* Like */}
            <button
              onClick={handleLike}
              disabled={isLoading}
              className={`flex items-center space-x-2 transition-colors group ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="p-2 rounded-full group-hover:bg-red-500/10">
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                )}
              </div>
              {likeCount > 0 && (
                <span className="text-sm">{formatCount(likeCount)}</span>
              )}
            </button>
            
            {/* Views */}
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-400 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-blue-400/10">
                <Eye size={18} />
              </div>
              {targetTweet.viewCount > 0 && (
                <span className="text-sm">{formatCount(targetTweet.viewCount)}</span>
              )}
            </button>
            
            {/* Share */}
            <button className="text-gray-500 hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-blue-400/10">
              <Share size={18} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default TweetCard;
