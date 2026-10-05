export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'technician';
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: number;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  email: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type Permission = 
  | 'manage_customers'
  | 'manage_appointments'
  | 'manage_technicians'
  | 'manage_services'
  | 'view_reports'
  | 'manage_users';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
} 