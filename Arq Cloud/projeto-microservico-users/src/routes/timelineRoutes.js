const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const auth = require('../middleware/auth');

// All routes require authentication
router.get('/', auth, timelineController.getTimeline);
router.post('/', auth, timelineController.createPost);
router.delete('/:id', auth, timelineController.deletePost);

module.exports = router;
