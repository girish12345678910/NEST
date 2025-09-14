import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
let currentToken: string | null = null;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
      console.log('API REQUEST with token:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log('API SUCCESS:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API ERROR:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

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
  setToken(token: string | null) {
    currentToken = token;
    console.log('TOKEN SET:', token ? 'YES' : 'NO');
  }

  async createTweet(tweetData: CreateTweetRequest): Promise<OriginalTweet> {
    console.log('CREATING TWEET:', tweetData);
    const response = await api.post('/tweets', tweetData);
    return response.data.data.tweet;
  }

  async getTweets(page = 1, limit = 20): Promise<{ tweets: Tweet[], pagination: any }> {
    const response = await api.get(`/tweets?page=${page}&limit=${limit}`);
    return response.data.data;
  }

  // ADD MISSING METHODS
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
    console.log('LIKE TWEET API CALL:', tweetId);
    await api.post(`/tweets/${tweetId}/like`);
  }

  async unlikeTweet(tweetId: string): Promise<void> {
    console.log('UNLIKE TWEET API CALL:', tweetId);
    await api.delete(`/tweets/${tweetId}/like`);
  }

  async retweetTweet(tweetId: string): Promise<void> {
    console.log('RETWEET API CALL:', tweetId);
    await api.post(`/tweets/${tweetId}/retweet`);
  }

  async unretweetTweet(tweetId: string): Promise<void> {
    console.log('UNRETWEET API CALL:', tweetId);
    await api.delete(`/tweets/${tweetId}/retweet`);
  }

  async deleteTweet(tweetId: string): Promise<void> {
    await api.delete(`/tweets/${tweetId}`);
  }
}

export const tweetService = new TweetService();
