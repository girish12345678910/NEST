import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  followerCount: number;
  followingCount: number;
  tweetCount: number;
  isVerified: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });

    const { user, token } = response.data.data;
    
    // Store in localStorage
    localStorage.setItem('nest_token', token);
    localStorage.setItem('nest_user', JSON.stringify(user));
    
    return { user, token };
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    
    const { user, token } = response.data.data;
    
    // Store in localStorage
    localStorage.setItem('nest_token', token);
    localStorage.setItem('nest_user', JSON.stringify(user));
    
    return { user, token };
  }

  logout(): void {
    localStorage.removeItem('nest_token');
    localStorage.removeItem('nest_user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('nest_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('nest_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
