const usersService = require('../services/usersService');
const eventsService = require('../services/eventsService');
const functionsService = require('../services/functionsService');

exports.register = async (req, res) => {
  try {
    const result = await usersService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await usersService.login(req.body);
    res.json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.socialAuth = async (req, res) => {
  try {
    const result = await usersService.socialAuth(req.body);
    res.json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const result = await usersService.getUsers(req.query, req.token);
    res.json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const result = await usersService.getUserById(req.params.id, req.token);
    res.json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const result = await usersService.updateUser(req.params.id, req.body, req.token);
    res.json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await usersService.deleteUser(req.params.id, req.token);
    res.status(204).send();
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const result = await eventsService.getEvents(req.query);
    res.json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const result = await eventsService.getEventById(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const result = await eventsService.createEvent(req.body, req.userId);

    functionsService.triggerNotification({
      type: 'new_event',
      userId: req.userId,
      eventId: result.id,
      title: 'Novo evento criado',
      message: `Seu evento "${result.name}" foi criado com sucesso!`
    }).catch(err => console.error('Notification error:', err));

    res.status(201).json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const result = await eventsService.updateEvent(req.params.id, req.body, req.userId);
    res.json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    await eventsService.deleteEvent(req.params.id, req.userId);
    res.status(204).send();
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.createReviewViaEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rating, comment } = req.body;

    const result = await functionsService.triggerReviewEvent({
      eventId: parseInt(eventId),
      userId: req.userId,
      rating,
      comment
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const result = await eventsService.getReviews(req.params.eventId, req.query);
    res.json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const result = await eventsService.updateReview(req.params.id, req.body, req.userId);
    res.json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await eventsService.deleteReview(req.params.id, req.userId);
    res.status(204).send();
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.getFriendships = async (req, res) => {
  try {
    const result = await usersService.getFriendships(req.query, req.token);
    res.json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.createFriendship = async (req, res) => {
  try {
    const result = await usersService.createFriendship(req.body, req.token);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const result = await functionsService.getUserNotifications(req.userId);
    res.json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};

module.exports = exports;
