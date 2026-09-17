import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const videoService = {
  getVideos: (params) => api.get('/videos', { params }),
  getVideoById: (id) => api.get(`/videos/${id}`),
  updateProgress: (id, progress) => api.post(`/videos/${id}/progress`, { progress })
};

export const subscriptionService = {
  getSubscriptions: () => api.get('/subscriptions'),
  getUserSubscription: () => api.get('/subscriptions/user'),
  purchaseSubscription: (subscriptionId) => api.post('/subscriptions/purchase', { subscriptionId }),
  purchaseVideo: (data) => api.post('/subscriptions/purchase-video', data)
};

export const streamService = {
  getLiveStreams: () => api.get('/streams/live')
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  getWatchHistory: (params) => api.get('/users/history', { params }),
  getPurchases: () => api.get('/users/purchases')
};

export default api;
