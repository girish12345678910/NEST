import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tweetService, Tweet } from '../services/tweetService';
import TweetCard from './TweetCard';
import TweetComposer from './TweetComposer';
import { RefreshCw } from 'lucide-react';

interface TimelineProps {
  type: 'home' | 'explore' | 'user';
  username?: string;
}

const Timeline: React.FC<TimelineProps> = ({ type, username }) => {
  const [replyingTo, setReplyingTo] = useState<Tweet | null>(null);
  
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['timeline', type, username],
    queryFn: async () => {
      if (type === 'user' && username) {
        return tweetService.getUserTweets(username);
      } else if (type === 'home') {
        return tweetService.getTimeline();
      } else {
        return tweetService.getTweets();
      }
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const handleReply = (tweet: Tweet) => {
    setReplyingTo(tweet);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Failed to load tweets</p>
        <button
          onClick={() => refetch()}
          className="text-blue-400 hover:text-blue-300"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-gray-700 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-200">
          {type === 'home' ? 'Home' : type === 'explore' ? 'Explore' : `@${username}`}
        </h1>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className={`p-2 rounded-full hover:bg-gray-800 transition-colors ${
            isFetching ? 'animate-spin' : ''
          }`}
        >
          <RefreshCw size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Tweet Composer (only on home timeline) */}
      {type === 'home' && (
        <div className="p-4 border-b border-gray-700">
          <TweetComposer />
        </div>
      )}

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 m-4 max-w-lg w-full">
            <div className="mb-4">
              <TweetCard tweet={replyingTo} />
            </div>
            <TweetComposer 
              replyTo={replyingTo.id}
              onSuccess={() => setReplyingTo(null)}
            />
            <button
              onClick={() => setReplyingTo(null)}
              className="mt-4 text-gray-400 hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tweet Feed */}
      <div className="divide-y divide-gray-700">
        {data?.tweets.map((tweet: Tweet) => (
          <div key={tweet.id} className="p-4">
            <TweetCard
              tweet={tweet}
              onReply={handleReply}
            />
          </div>
        ))}
      </div>

      {/* Load More */}
      {data?.pagination?.hasMore && (
        <div className="p-4 text-center">
          <button className="text-blue-400 hover:text-blue-300">
            Load more tweets
          </button>
        </div>
      )}

      {/* Empty State */}
      {data?.tweets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-xl mb-2">No tweets yet</p>
          <p className="text-gray-500">
            {type === 'home' 
              ? 'Follow some users to see their tweets here' 
              : 'Be the first to tweet!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Timeline;
