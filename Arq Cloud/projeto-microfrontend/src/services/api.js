import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const EVENTS_SERVICE_URL = 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

export const getDashboard = () => api.get('/dashboard');
export const getNearbyEvents = (radius = 10) => api.get(`/events/nearby?radius=${radius}`);
export const globalSearch = (query) => api.get(`/search?q=${query}`);

export const getEvents = (params = {}) => api.get('/events', { params });
export const getEventById = (id) => api.get(`/events/${id}`);
export const getEventDetails = (id) => api.get(`/events/${id}`);
export const createEvent = (data) => api.post('/events', data);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);

export const getReviews = (eventId) => Promise.resolve({ data: { reviews: [] } }); // Desabilitado temporariamente
export const createReviewViaEvent = (eventId, data) =>
  api.post(`/events/${eventId}/reviews/event`, data);

export const getUsers = (search = '') => api.get(`/users?search=${search}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);

export const getFriendships = () => api.get('/friendships');
export const createFriendship = (friendId) => api.post('/friendships', { friendId });
export const deleteFriendship = (id) => api.delete(`/friendships/${id}`);

export const getNotifications = () => api.get('/notifications');

// Interest endpoints - usando serviço direto temporariamente
export const getInterests = (eventId, params = {}) => axios.get(`${EVENTS_SERVICE_URL}/events/${eventId}/interest`, { params });
export const createInterest = (eventId, data) => {
  const token = localStorage.getItem('token');
  return axios.post(`${EVENTS_SERVICE_URL}/events/${eventId}/interest`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
export const updateInterest = (eventId, interestId, data) => {
  const token = localStorage.getItem('token');
  return axios.put(`${EVENTS_SERVICE_URL}/events/${eventId}/interest/${interestId}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
export const deleteInterest = (eventId, interestId) => {
  const token = localStorage.getItem('token');
  return axios.delete(`${EVENTS_SERVICE_URL}/events/${eventId}/interest/${interestId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export default api;
