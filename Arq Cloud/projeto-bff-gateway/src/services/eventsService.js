const axios = require('axios');

const EVENTS_SERVICE_URL = process.env.EVENTS_SERVICE_URL;

class EventsService {
  // Events CRUD
  async getEvents(params) {
    const response = await axios.get(`${EVENTS_SERVICE_URL}/events`, { params });
    return response.data;
  }

  async getEventById(id) {
    const response = await axios.get(`${EVENTS_SERVICE_URL}/events/${id}`);
    return response.data;
  }

  async createEvent(data, userId) {
    const response = await axios.post(`${EVENTS_SERVICE_URL}/events`, data, {
      headers: { 'X-User-Id': userId }
    });
    return response.data;
  }

  async updateEvent(id, data, userId) {
    const response = await axios.put(`${EVENTS_SERVICE_URL}/events/${id}`, data, {
      headers: { 'X-User-Id': userId }
    });
    return response.data;
  }

  async deleteEvent(id, userId) {
    const response = await axios.delete(`${EVENTS_SERVICE_URL}/events/${id}`, {
      headers: { 'X-User-Id': userId }
    });
    return response.data;
  }

  async getCategories() {
    const response = await axios.get(`${EVENTS_SERVICE_URL}/events/categories`);
    return response.data;
  }

  // Reviews
  async getReviews(eventId, params) {
    const response = await axios.get(`${EVENTS_SERVICE_URL}/events/${eventId}/reviews`, { params });
    return response.data;
  }

  async createReview(eventId, data, userId) {
    const response = await axios.post(`${EVENTS_SERVICE_URL}/events/${eventId}/reviews`, data, {
      headers: { 'X-User-Id': userId }
    });
    return response.data;
  }

  async updateReview(reviewId, data, userId) {
    const response = await axios.put(`${EVENTS_SERVICE_URL}/reviews/${reviewId}`, data, {
      headers: { 'X-User-Id': userId }
    });
    return response.data;
  }

  async deleteReview(reviewId, userId) {
    const response = await axios.delete(`${EVENTS_SERVICE_URL}/reviews/${reviewId}`, {
      headers: { 'X-User-Id': userId }
    });
    return response.data;
  }

  // Interest
  async getInterests(eventId, params) {
    const response = await axios.get(`${EVENTS_SERVICE_URL}/events/${eventId}/interest`, { params });
    return response.data;
  }

  async createInterest(eventId, data, userId) {
    const response = await axios.post(`${EVENTS_SERVICE_URL}/events/${eventId}/interest`, data, {
      headers: { 'X-User-Id': userId }
    });
    return response.data;
  }

  async updateInterest(eventId, interestId, data, userId) {
    const response = await axios.put(`${EVENTS_SERVICE_URL}/events/${eventId}/interest/${interestId}`, data, {
      headers: { 'X-User-Id': userId }
    });
    return response.data;
  }

  async deleteInterest(eventId, interestId, userId) {
    const response = await axios.delete(`${EVENTS_SERVICE_URL}/events/${eventId}/interest/${interestId}`, {
      headers: { 'X-User-Id': userId }
    });
    return response.data;
  }
}

module.exports = new EventsService();
