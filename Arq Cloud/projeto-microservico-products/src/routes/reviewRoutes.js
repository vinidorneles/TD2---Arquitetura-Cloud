const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// Public routes
router.get('/events/:id/reviews', reviewController.getReviews);

// Protected routes
router.post('/events/:id/reviews', auth, reviewController.createReview);
router.put('/reviews/:id', auth, reviewController.updateReview);
router.delete('/reviews/:id', auth, reviewController.deleteReview);

module.exports = router;
