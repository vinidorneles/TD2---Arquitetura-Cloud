const express = require('express');
const router = express.Router();
const interestController = require('../controllers/interestController');
const auth = require('../middleware/auth');

router.get('/events/:id/interest', interestController.getInterests);

router.post('/events/:id/interest', auth, interestController.createInterest);
router.put('/events/:id/interest/:interestId', auth, interestController.updateInterest);
router.delete('/events/:id/interest/:interestId', auth, interestController.deleteInterest);

module.exports = router;
