import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Dashboard & Aggregation
export const getDashboard = () => api.get('/dashboard');
export const getNearbyEvents = (radius = 10) => api.get(`/events/nearby?radius=${radius}`);
export const globalSearch = (query) => api.get(`/search?q=${query}`);

// Events
export const getEvents = (params = {}) => api.get('/events', { params });
export const getEventById = (id) => api.get(`/events/${id}`);
export const getEventDetails = (id) => api.get(`/events/${id}/details`);
export const createEvent = (data) => api.post('/events', data);

// Reviews
export const getReviews = (eventId) => api.get(`/events/${eventId}/reviews`);
export const createReviewViaEvent = (eventId, data) =>
  api.post(`/events/${eventId}/reviews/event`, data);

// Users
export const getUsers = (search = '') => api.get(`/users?search=${search}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);

// Friendships
export const getFriendships = () => api.get('/friendships');
export const createFriendship = (friendId) => api.post('/friendships', { friendId });

// Notifications
export const getNotifications = () => api.get('/notifications');

export default api;
