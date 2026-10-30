import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('weather_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if already on login/register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('weather_token');
        localStorage.removeItem('weather_user');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

export const weatherApi = {
  getCurrent: () => api.get('/weather/current'),
  refreshCurrent: () => api.post('/weather/refresh'),
  getHistory: (params) => api.get('/weather/history', { params }),
  getStats: (params) => api.get('/weather/stats', { params }),
  exportCsv: (params) => api.get('/weather/export', { params, responseType: 'blob' })
};

export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getLogs: (params) => api.get('/admin/logs', { params }),
  deleteRecord: (id) => api.delete(`/admin/weather/${id}`),
  getStats: () => api.get('/admin/stats')
};

export default api;
