const axios = require('axios');

const FUNCTIONS_SERVICE_URL = process.env.FUNCTIONS_SERVICE_URL;

class FunctionsService {
  async triggerReviewEvent(data) {
    const response = await axios.post(`${FUNCTIONS_SERVICE_URL}/review-event`, data);
    return response.data;
  }

  async triggerNotification(data) {
    const response = await axios.post(`${FUNCTIONS_SERVICE_URL}/notification`, data);
    return response.data;
  }

  async getUserNotifications(userId) {
    const response = await axios.get(`${FUNCTIONS_SERVICE_URL}/notifications/${userId}`);
    return response.data;
  }
}

module.exports = new FunctionsService();
