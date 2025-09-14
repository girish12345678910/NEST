import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Eye } from 'lucide-react';
import { tweetService } from '../services/tweetService';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@clerk/clerk-react';

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
  const targetTweet = tweet.type === 'retweet' ? tweet.originalTweet : tweet;
  
  // LOG INITIAL STATE FROM BACKEND
  console.log('TWEETCARD INITIALIZATION:', {
    tweetId: targetTweet.id,
    tweetType: tweet.type,
    initialIsLiked: targetTweet.isLiked,
    initialIsRetweeted: targetTweet.isRetweeted,
    initialLikeCount: targetTweet.likeCount,
    initialRetweetCount: targetTweet.retweetCount,
    backendData: targetTweet
  });
  
  const [isLiked, setIsLiked] = useState(targetTweet.isLiked);
  const [isRetweeted, setIsRetweeted] = useState(targetTweet.isRetweeted);
  const [likeCount, setLikeCount] = useState(targetTweet.likeCount);
  const [retweetCount, setRetweetCount] = useState(targetTweet.retweetCount);
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();

  // UPDATE STATE WHEN PROPS CHANGE (important for refreshes)
  useEffect(() => {
    console.log('TWEETCARD STATE UPDATE:', {
      tweetId: targetTweet.id,
      oldIsLiked: isLiked,
      newIsLiked: targetTweet.isLiked,
      oldIsRetweeted: isRetweeted,
      newIsRetweeted: targetTweet.isRetweeted
    });
    
    setIsLiked(targetTweet.isLiked);
    setIsRetweeted(targetTweet.isRetweeted);
    setLikeCount(targetTweet.likeCount);
    setRetweetCount(targetTweet.retweetCount);
  }, [targetTweet.isLiked, targetTweet.isRetweeted, targetTweet.likeCount, targetTweet.retweetCount, targetTweet.id]);

  const formatCount = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    console.log('=== LIKE BUTTON CLICKED ===');
    console.log('Current isLiked state:', isLiked);
    console.log('Tweet ID:', targetTweet.id);
    
    try {
      setIsLoading(true);
      const token = await getToken();
      
      if (!token) {
        console.log('No token available');
        alert('Please log in to like tweets');
        return;
      }

      console.log('Token obtained, setting in service');
      tweetService.setToken(token);
      
      // Twitter logic: Toggle the like state
      const newIsLiked = !isLiked;
      const newLikeCount = newIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
      
      console.log('Toggling like state:', {
        from: isLiked,
        to: newIsLiked,
        countChange: `${likeCount} → ${newLikeCount}`
      });
      
      // Optimistic update
      setIsLiked(newIsLiked);
      setLikeCount(newLikeCount);

      // API call based on desired state
      if (newIsLiked) {
        console.log('Adding like...');
        await tweetService.likeTweet(targetTweet.id);
        console.log('✅ LIKE ADDED');
      } else {
        console.log('Removing like...');
        await tweetService.unlikeTweet(targetTweet.id);
        console.log('✅ LIKE REMOVED');
      }

    } catch (error: any) {
      console.error('=== LIKE FAILED ===');
      console.error('Error details:', error);
      console.error('Error response:', error.response?.data);
      
      // Revert optimistic update
      console.log('Reverting like state to original values');
      setIsLiked(targetTweet.isLiked);
      setLikeCount(targetTweet.likeCount);
      
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Like action failed: ${errorMsg}`);
    } finally {
      setIsLoading(false);
      console.log('=== LIKE OPERATION COMPLETE ===');
    }
  };

  const handleRetweet = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    console.log('=== RETWEET BUTTON CLICKED ===');
    console.log('Current isRetweeted state:', isRetweeted);
    console.log('Tweet ID:', targetTweet.id);
    
    try {
      setIsLoading(true);
      const token = await getToken();
      
      if (!token) {
        console.log('No token available');
        alert('Please log in to retweet');
        return;
      }

      console.log('Token obtained, setting in service');
      tweetService.setToken(token);
      
      // Twitter logic: Toggle the retweet state
      const newIsRetweeted = !isRetweeted;
      const newRetweetCount = newIsRetweeted ? retweetCount + 1 : Math.max(0, retweetCount - 1);
      
      console.log('Toggling retweet state:', {
        from: isRetweeted,
        to: newIsRetweeted,
        countChange: `${retweetCount} → ${newRetweetCount}`
      });
      
      // Optimistic update
      setIsRetweeted(newIsRetweeted);
      setRetweetCount(newRetweetCount);

      // API call based on desired state
      if (newIsRetweeted) {
        console.log('Adding retweet...');
        await tweetService.retweetTweet(targetTweet.id);
        console.log('✅ RETWEET ADDED');
        
        // Only refresh when adding a retweet to show the new retweet post
        console.log('Refreshing page to show new retweet post...');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        console.log('Removing retweet...');
        await tweetService.unretweetTweet(targetTweet.id);
        console.log('✅ RETWEET REMOVED');
        
        // No refresh needed when removing retweet
        console.log('No refresh needed for unretweet');
      }

    } catch (error: any) {
      console.error('=== RETWEET FAILED ===');
      console.error('Error details:', error);
      console.error('Error response:', error.response?.data);
      
      // Revert optimistic update
      console.log('Reverting retweet state to original values');
      setIsRetweeted(targetTweet.isRetweeted);
      setRetweetCount(targetTweet.retweetCount);
      
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Retweet action failed: ${errorMsg}`);
    } finally {
      setIsLoading(false);
      console.log('=== RETWEET OPERATION COMPLETE ===');
    }
  };

  return (
    <article className="bg-gray-900 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors">
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
        <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-black font-bold">
            {targetTweet?.author?.displayName?.charAt(0)?.toUpperCase() || 
             targetTweet?.author?.username?.charAt(0)?.toUpperCase() || 
             'U'}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-gray-200 truncate">
              {targetTweet?.author?.displayName || targetTweet?.author?.username || 'Unknown User'}
            </h3>
            {targetTweet?.author?.isVerified && (
              <div className="w-4 h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                <span className="text-black text-xs">✓</span>
              </div>
            )}
            <span className="text-gray-500 truncate">
              @{targetTweet?.author?.username || 'unknown'}
            </span>
            <span className="text-gray-500">·</span>
            <time className="text-gray-500 text-sm">
              {targetTweet?.createdAt ? formatDistanceToNow(new Date(targetTweet.createdAt), { addSuffix: true }) : 'Unknown time'}
            </time>
            
            <button className="ml-auto text-gray-500 hover:text-gray-300 p-1 rounded-full hover:bg-gray-800">
              <MoreHorizontal size={16} />
            </button>
          </div>
          
          <div className="mt-2">
            <p className="text-gray-200 whitespace-pre-wrap break-words">
              {targetTweet?.content || 'No content available'}
            </p>
          </div>
          
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
