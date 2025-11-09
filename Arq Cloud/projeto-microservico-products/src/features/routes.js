/**
 * VERTICAL SLICE ROUTES
 * Each route maps directly to a feature
 */

const express = require('express');
const authMiddleware = require('../middleware/auth');

// Import features
const CreateEvent = require('./events/CreateEvent');
const GetEvents = require('./events/GetEvents');
const GetEventById = require('./events/GetEventById');

const router = express.Router();

// Event Features
router.post('/events', authMiddleware, CreateEvent);
router.get('/events', GetEvents);
router.get('/events/:id', GetEventById);

// Reviews and Interests can be added as separate features following the same pattern

module.exports = router;
