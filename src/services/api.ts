import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token ekleyen interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Hata yönetimi için interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // 401 hatası ve token yenileme durumu
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh token ile yeni token alma
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });
        
        const { token } = response.data;
        localStorage.setItem('token', token);
        
        // Orijinal isteği tekrar gönder
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${token}`,
        };
        
        return axios(originalRequest);
      } catch (refreshError) {
        // Token yenileme başarısız - logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Diğer hata durumları
    let errorMessage = 'Bir hata oluştu';
    if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
      errorMessage = error.response.data.message as string;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Özelleştirilmiş hata nesnesi döndür
    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  }
);

export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
  },
  customers: {
    base: '/customers',
    byId: (id: string) => `/customers/${id}`,
    vehicles: (id: string) => `/customers/${id}/vehicles`,
  },
  appointments: {
    base: '/appointments',
    byId: (id: string) => `/appointments/${id}`,
    byCustomer: (customerId: string) => `/customers/${customerId}/appointments`,
  },
  technicians: {
    base: '/technicians',
    byId: (id: string) => `/technicians/${id}`,
    schedule: (id: string) => `/technicians/${id}/schedule`,
  },
  financial: {
    base: '/financial',
    invoices: '/financial/invoices',
    payments: '/financial/payments',
  },
}; 