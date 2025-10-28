const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const auth = require('../middleware/auth');

router.get('/', auth, timelineController.getTimeline);
router.post('/', auth, timelineController.createPost);
router.delete('/:id', auth, timelineController.deletePost);

module.exports = router;
