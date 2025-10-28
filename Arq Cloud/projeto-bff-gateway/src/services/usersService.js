const axios = require('axios');

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;

class UsersService {
  async register(data) {
    const response = await axios.post(`${USERS_SERVICE_URL}/auth/register`, data);
    return response.data;
  }

  async login(data) {
    const response = await axios.post(`${USERS_SERVICE_URL}/auth/login`, data);
    return response.data;
  }

  async socialAuth(data) {
    const response = await axios.post(`${USERS_SERVICE_URL}/auth/social`, data);
    return response.data;
  }

  async getUsers(params, token) {
    const response = await axios.get(`${USERS_SERVICE_URL}/users`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async getUserById(id, token) {
    const response = await axios.get(`${USERS_SERVICE_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async updateUser(id, data, token) {
    const response = await axios.put(`${USERS_SERVICE_URL}/users/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async deleteUser(id, token) {
    const response = await axios.delete(`${USERS_SERVICE_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async getFriendships(params, token) {
    const response = await axios.get(`${USERS_SERVICE_URL}/friendships`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async createFriendship(data, token) {
    const response = await axios.post(`${USERS_SERVICE_URL}/friendships`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async updateFriendship(id, data, token) {
    const response = await axios.put(`${USERS_SERVICE_URL}/friendships/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async deleteFriendship(id, token) {
    const response = await axios.delete(`${USERS_SERVICE_URL}/friendships/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async getTimeline(params, token) {
    const response = await axios.get(`${USERS_SERVICE_URL}/timeline`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async createPost(data, token) {
    const response = await axios.post(`${USERS_SERVICE_URL}/timeline`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async deletePost(id, token) {
    const response = await axios.delete(`${USERS_SERVICE_URL}/timeline/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}

module.exports = new UsersService();
