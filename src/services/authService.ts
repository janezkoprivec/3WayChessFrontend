import { ApiService } from './api';
import { API_CONFIG } from '../config/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    _id: string;
    username: string;
    email: string;
  };
  token: string;
}

export interface UserResponse {
  user: {
    _id: string;
    username: string;
    email: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await ApiService.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await ApiService.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      userData
    );
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  static clearToken(): void {
    localStorage.removeItem('auth_token');
  }

  static async getCurrentUser(): Promise<User> {
    try {
      const response = await ApiService.get<UserResponse>('/auth/me');
      return {
        id: response.data.user._id, 
        username: response.data.user.username,
        email: response.data.user.email,
      };
    } catch (error) {
      // If the /auth/me endpoint doesn't exist yet, create a basic user
      // This is a temporary solution until the backend is ready
      console.warn('Auth endpoint not available, using fallback user');
      return {
        id: '1',
        username: 'user',
        email: 'user@example.com',
      };
    }
  }
} 