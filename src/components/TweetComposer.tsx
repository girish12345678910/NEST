import React, { useState, useRef } from 'react';
import { Send, Image, Smile, X, FileText } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tweetService, CreateTweetRequest } from '../services/tweetService';

interface TweetComposerProps {
  replyTo?: string;
  quoteTweet?: string;
  onSuccess?: () => void;
}

const TweetComposer: React.FC<TweetComposerProps> = ({ replyTo, quoteTweet, onSuccess }) => {
  const [tweet, setTweet] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  const maxLength = 280;

  const createTweetMutation = useMutation({
    mutationFn: (data: CreateTweetRequest) => {
      console.log('Creating tweet with data:', data);
      return tweetService.createTweet(data);
    },
    onSuccess: (data) => {
      console.log('Tweet created successfully:', data);
      setTweet('');
      setMediaFiles([]);
      setIsExpanded(false);
      setError('');
      // Invalidate and refetch tweets
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Failed to create tweet:', error);
      setError(error.response?.data?.message || 'Failed to create tweet. Please try again.');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, tweet content:', tweet);
    
    if (tweet.trim() && !createTweetMutation.isPending) {
      setError('');
      console.log('About to create tweet...');
      
      createTweetMutation.mutate({
        content: tweet.trim(),
        replyTo,
        quoteTweet
      });
    }
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 4 - mediaFiles.length);
      setMediaFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const remainingChars = maxLength - tweet.length;
  const isOverLimit = remainingChars < 0;
  const canSubmit = tweet.trim() && !isOverLimit && !createTweetMutation.isPending;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-6">
      {/* Show error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Show loading state */}
      {createTweetMutation.isPending && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500 text-blue-400 rounded-lg text-sm">
          Creating your tweet...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          {/* User Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold">U</span>
          </div>
          
          <div className="flex-1">
            {/* Reply/Quote Context */}
            {replyTo && (
              <div className="mb-2 text-sm text-gray-400">
                Replying to <span className="text-blue-400">@someone</span>
              </div>
            )}
            
            {/* Tweet Input */}
            <textarea
              value={tweet}
              onChange={(e) => setTweet(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder={replyTo ? "Tweet your reply" : "What's happening?"}
              className="w-full bg-transparent text-gray-200 text-xl placeholder-gray-500 border-none resize-none focus:outline-none"
              rows={isExpanded ? 4 : 2}
              maxLength={maxLength + 20}
            />
            
            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative bg-gray-800 rounded-lg p-3 border border-gray-600">
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute -top-2 -right-2 bg-gray-700 rounded-full p-1 hover:bg-gray-600"
                    >
                      <X size={14} />
                    </button>
                    <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-300 truncate">{file.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Tweet Actions */}
            {isExpanded && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
                <div className="flex items-center space-x-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaSelect}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={mediaFiles.length >= 4}
                    className="text-gray-400 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-2 rounded-full hover:bg-gray-800"
                  >
                    <Image size={20} />
                  </button>
                  
                  <button
                    type="button"
                    className="text-gray-400 hover:text-yellow-400 transition-colors p-2 rounded-full hover:bg-gray-800"
                  >
                    <Smile size={20} />
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Character Counter */}
                  <div className="flex items-center space-x-2">
                    {isExpanded && (
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                        isOverLimit 
                          ? 'border-red-500 text-red-500' 
                          : remainingChars <= 20 
                            ? 'border-yellow-500 text-yellow-500' 
                            : 'border-gray-500 text-gray-400'
                      }`}>
                        {remainingChars <= 20 ? remainingChars : ''}
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="bg-gradient-to-r from-gray-300 to-gray-400 text-black font-semibold py-2 px-6 rounded-full hover:from-white hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                  >
                    {createTweetMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    <span>{replyTo ? 'Reply' : 'Tweet'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default TweetComposer;
