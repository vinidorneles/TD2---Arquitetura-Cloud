const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const proxyController = require('../controllers/proxyController');
const aggregationController = require('../controllers/aggregationController');

router.post('/auth/register', proxyController.register);
router.post('/auth/login', proxyController.login);
router.post('/auth/social', proxyController.socialAuth);

router.get('/dashboard', auth, aggregationController.getDashboard);
router.get('/events/:id/details', auth, aggregationController.getEventDetail);
router.get('/events/nearby', auth, aggregationController.getNearbyEvents);
router.get('/friends/:friendId/activities', auth, aggregationController.getFriendActivities);
router.get('/search', auth, aggregationController.globalSearch);

router.get('/users', auth, proxyController.getUsers);
router.get('/users/:id', auth, proxyController.getUserById);
router.put('/users/:id', auth, proxyController.updateUser);
router.delete('/users/:id', auth, proxyController.deleteUser);

router.get('/friendships', auth, proxyController.getFriendships);
router.post('/friendships', auth, proxyController.createFriendship);

router.get('/events', proxyController.getEvents);
router.get('/events/:id', proxyController.getEventById);

router.post('/events', auth, proxyController.createEvent);
router.put('/events/:id', auth, proxyController.updateEvent);
router.delete('/events/:id', auth, proxyController.deleteEvent);

router.post('/events/:eventId/reviews/event', auth, proxyController.createReviewViaEvent);

router.get('/events/:eventId/reviews', proxyController.getReviews);
router.put('/reviews/:id', auth, proxyController.updateReview);
router.delete('/reviews/:id', auth, proxyController.deleteReview);

router.get('/notifications', auth, proxyController.getNotifications);

module.exports = router;
