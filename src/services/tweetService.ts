import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nest_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Updated Tweet interfaces to match backend
export interface Author {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isVerified: boolean;
}

export interface BaseTweet {
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

export interface OriginalTweet extends BaseTweet {
  type: 'original';
  updatedAt: string;
}

export interface RetweetTweet {
  id: string;
  type: 'retweet';
  retweeter: Author;
  retweetedAt: string;
  originalTweet: BaseTweet;
}

export type Tweet = OriginalTweet | RetweetTweet;

export interface CreateTweetRequest {
  content: string;
  mediaUrls?: string[];
  replyTo?: string;
  quoteTweet?: string;
}

class TweetService {
  async createTweet(tweetData: CreateTweetRequest): Promise<OriginalTweet> {
    try {
      console.log('TweetService.createTweet called with:', tweetData);
      const response = await api.post('/tweets', tweetData);
      console.log('Tweet creation response:', response.data);
      return response.data.data.tweet;
    } catch (error) {
      console.error('TweetService.createTweet error:', error);
      throw error;
    }
  }

  async getTweets(page = 1, limit = 20): Promise<{ tweets: Tweet[], pagination: any }> {
    const response = await api.get(`/tweets?page=${page}&limit=${limit}`);
    return response.data.data;
  }

  async getTimeline(page = 1, limit = 20): Promise<{ tweets: Tweet[], pagination: any }> {
    const response = await api.get(`/tweets?page=${page}&limit=${limit}`);
    return response.data.data;
  }

  async getUserTweets(username: string, page = 1, limit = 20): Promise<{ tweets: Tweet[], user: any, pagination: any }> {
    const response = await api.get(`/tweets/user/${username}?page=${page}&limit=${limit}`);
    return response.data.data;
  }

  async getTweet(tweetId: string): Promise<Tweet> {
    const response = await api.get(`/tweets/${tweetId}`);
    return response.data.data.tweet;
  }

  async likeTweet(tweetId: string): Promise<void> {
    console.log('TweetService.likeTweet called for:', tweetId);
    const response = await api.post(`/tweets/${tweetId}/like`);
    console.log('Like API response:', response.data);
  }

  async unlikeTweet(tweetId: string): Promise<void> {
    console.log('TweetService.unlikeTweet called for:', tweetId);
    const response = await api.delete(`/tweets/${tweetId}/like`);
    console.log('Unlike API response:', response.data);
  }

  async retweetTweet(tweetId: string): Promise<void> {
    console.log('TweetService.retweetTweet called for:', tweetId);
    const response = await api.post(`/tweets/${tweetId}/retweet`);
    console.log('Retweet API response:', response.data);
  }

  async unretweetTweet(tweetId: string): Promise<void> {
    console.log('TweetService.unretweetTweet called for:', tweetId);
    const response = await api.delete(`/tweets/${tweetId}/retweet`);
    console.log('Unretweet API response:', response.data);
  }

  async deleteTweet(tweetId: string): Promise<void> {
    await api.delete(`/tweets/${tweetId}`);
  }
}

export const tweetService = new TweetService();
