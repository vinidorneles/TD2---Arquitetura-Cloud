const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');
const auth = require('../middleware/auth');

// All routes require authentication
router.get('/', auth, friendshipController.getFriendships);
router.post('/', auth, friendshipController.createFriendship);
router.put('/:id', auth, friendshipController.updateFriendship);
router.delete('/:id', auth, friendshipController.deleteFriendship);

module.exports = router;
